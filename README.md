## Introduction

In this post, we'll explore how to implement Google OAuth2 with React, Flask, and JWT to create a secure and seamless authentication system for web applications. OAuth2 is a widely used authorization protocol that allows users to grant access to their data to third-party applications, while JWT (JSON Web Tokens) is a popular method for securely transmitting authorization data. Together, OAuth2 and JWT provide a robust solution for both authentication and authorization in web applications.

### Authentication vs Authorization

Authentication verifies user identity, while authorization grants access based on permissions. In our system, we will use `Google OAuth2` for authentication and `JWT` for authorization.

### What is JWT?

A `JWT` (JSON Web Token) securely encodes information about a user's identity and permissions. It is typically signed with a secret key by the server to verify its integrity. JWTs can be used to protect specific routes in an API server, as the client includes the JWT in requests. The server then decodes the JWT to determine the sender's identity and permissions.

### Authentication flow

![Google OAuth2 flow](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c2hjsyw1y2i41380eh9i.png)

1. The client sends an authentication request to the OAuth server (Google OAuth2).
2. An access token is returned to the client.
3. The Access token is then sent from the client to the API server (flask).
4. API server verifies the token with the OAuth server, to confirm the client is authorized to consume that resource.
5. OAuth server responds with user credentials (name, email, etc).
6. API Server encrypts a JWT using user credentials and send it to the client.
7. From now on, any request the client sends to the API server will be with the JWT as a header.

---

## Setup

To set up Google OAuth2 with React, Flask, and JWT, follow these steps:

1. Create OAuth client credentials in the [Google Developer Consolehttps://console.cloud.google.com/apis/credentials). Go to the console, navigate to credentials, and create a new OAuth client ID for a web application. Add `http://localhost` and `http://localhost:<port_number>` (in our case `http://localhost:3000`) to the Authorized JavaScript origins box for local tests or development. Click Save.

2. Clone the repository for our demo project from https://github.com/eli-entelis/Flask-React-Google-OAuth2-Demo.git.

3. Set up Flask by opening a command prompt or terminal in the directory that contains the cloned repository and running the following commands:

   ```shell
   cd Flask
   pip install -r requirements.txt
   ```

4. Create a .env file in the Flask directory to configure the GOOGLE_CLIENT_ID and GOOGLE_SECRET_KEY environment variables. You can obtain these values from the [Google Developer Console](https://console.cloud.google.com/apis/credentials). Click on the credential you just created, and on the right side, you will find the Client ID and Client secret. Add the following lines to the .env file:
   ```
   #.env
   GOOGLE_CLIENT_ID=<insert here client id>
   GOOGLE_SECRET_KEY=<insert here secret key>
   ```
5. To execute the API server, run the following command:

   ```
   python .\app.py
   ```

   Go to http://127.0.0.1:5000/ in your web browser, and if
   everything works correctly, you should see a **_"Hello,
   World!"_** response.

6. To Set up React, go to `react-client/src/App.js` and insert to the `<GoogleOAuthProvider>` componet the Google `Client ID`:

   ```
   <GoogleOAuthProvider clientId="<insert here client id>">
   ```

   this will be explained in a bit.

7. open a command prompt or terminal in the directory that contains the cloned repository and run the following commands:
   `shell
    cd react-client
    npm install
    npm start
    `
   This will install the required dependencies and start the React development server. You can access the React application in your browser at http://127.0.0.1:3000/. If everything is set up correctly, you should see the this result.

## <img width="100%" style="width:100%" src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjlhNzYyYzU3NmU3YjkxNDc0OTMzN2JiYjMzNzU4NjE2ZjBmZWRhZCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/QB2e3bVuzJsDyKY2H7/giphy.gif">

## Implementation details

Let's dive into the implementation details, starting with the client-side code in the `getUserInfo` function under the `<Auth>` component in `src/auth/auth.js`:

```javascript
async function getUserInfo(codeResponse) {
  var response = await fetch("http://127.0.0.1:5000/google_login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: codeResponse.code }),
  });
  return await response.json();
}
```

This function is an asynchronous function that takes a `codeResponse` object as an argument, which is the response object returned from the successful Google login flow. It sends a POST request to our API server endpoint (http://127.0.0.1:5000/google_login) with the `code` property from the `codeResponse` object as the request body in JSON format. The response from the server is then parsed as JSON and returned, containing the user information and `JWT`.

Now let's take a look at the `<Auth>` component itself.

```javascript
export default function Auth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      var loginDetails = await getUserInfo(codeResponse);
      setLoggedIn(true);
      setUser(loginDetails.user);
    },
  });

  const handleLogout = () => {
    setLoggedIn(false);
    setUser(false);
  };

  return (
    <>
      {!loggedIn ? (
        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={() => googleLogin()}
        >
          <GoogleIcon fontSize="large" />
        </IconButton>
      ) : (
        <UserAvatar userName={user.name} onClick={handleLogout}></UserAvatar>
      )}
    </>
  );
}
```

This is the main component for handling authentication. It uses the `useGoogleLogin` hook from the [`@react-oauth/google`](https://github.com/MomenSherif/react-oauth) library to handle the Google login flow.

Inside the `useGoogleLogin` hook, the flow property is set to `auth-code`, indicating that it is using the authorization code flow for authentication. The `onSuccess` callback is triggered when the login is successful, and it receives a `codeResponse` object as an argument, which is passed to the `getUserInfo`. Once the user information is received, the `loggedIn` state is set to true and the `user` state is updated with the user information.

:warning: It is generally not recommended to store the JWT token in React state, as it can be susceptible to security risks. For more details read here [here](https://javascript.plainenglish.io/where-to-store-the-json-web-token-jwt-4f76abcd4577)

To use the [`@react-oauth/google`](https://github.com/MomenSherif/react-oauth) we need to wrap our component with `<GoogleOAuthProvider>` and pass it the same `Client ID` we used in previous steps.  
:exclamation: Without this step the client wouldn't be able to authenticate. You can see an example at `src/App.js`

```javascript
<GoogleOAuthProvider clientId="<insert here client id>">
  <Auth></Auth>
</GoogleOAuthProvider>
```

---

Lastly, let's take a look at the Flask code.

```python
@app.route('/google_login', methods=['POST'])
def login():
    auth_code = request.get_json()['code']

    data = {
        'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,  # client ID from the credential at google developer console
        'client_secret': GOOGLE_SECRET_KEY,  # client secret from the credential at google developer console
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data).json()
    headers = {
        'Authorization': f'Bearer {response["access_token"]}'
    }
    user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()

    """
        check here if user exists in database
    """

    jwt_token = create_access_token(identity=user_info['email'])  # create jwt token
    user_info["jwt"] = jwt_token
    return jsonify(user=user_info), 200
```

This code snippet is a `Flask` route that handles a request sent by the client after a successful login with `Google OAuth2`. It retrieves the authorization code, exchanges it for an access token, fetches user information, creates a JWT token, and includes it in the response JSON with the user information.

### Authorization

From now on, you can protect any Flask route with the `@jwt_required` decorator and get the decoded JWT with the `get_jwt_identity` function. Both are imported from `flask_jwt_extended` library.
Here is how:

```python
# Protect a route with jwt_required, which will kick out requests
# without a valid JWT present.
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
```

This is how a request to the `@/protected` route from our react client look like

```javascript
export async function getProtectedResource(jwt) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${jwt}`);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `http://127.0.0.1:5000/protected/`,
    requestOptions
  );
  return await response.json();
}
```

Take note that we send the `JWT` as part of a `Authorization` header with the pretext of `Bearer`:exclamation:

### Resources

- [Github's repository of the Demo](https://github.com/eli-entelis/Flask-React-Google-OAuth2-Demo).
- [react-oauth/google](https://github.com/MomenSherif/react-oauth) npm package used for google authentication on React's side.
- [JWT documentation](https://auth0.com/docs/secure/tokens/json-web-tokens)

---

:v: Contact me on:   
Linkdin: [Eli Entelis](https://www.linkedin.com/in/eli-entelis/)  
Github: [eli-entelis](https://github.com/eli-entelis/eli-entelis)  
Email: elientelis1999@gmail.com
