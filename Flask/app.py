import os

import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token, JWTManager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize JWTManager
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace with your own secret key
jwt = JWTManager(app)

load_dotenv()  # Load the environment variables from the .env file

GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
GOOGLE_SECRET_KEY = os.environ['GOOGLE_SECRET_KEY']


@app.route('/', methods=['GET'])
def hello_world():
    return "hello world"


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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
