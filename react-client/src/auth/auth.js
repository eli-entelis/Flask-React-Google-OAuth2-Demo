import React, { useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import IconButton from "@mui/material/IconButton";
import { useGoogleLogin } from "@react-oauth/google";
import UserAvatar from "./userAvatar";

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
