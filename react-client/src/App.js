import logo from "./logo.svg";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Auth from "./auth/auth";
import React from "react";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <GoogleOAuthProvider clientId="<insert here client id>">
          <Auth></Auth>
        </GoogleOAuthProvider>
      </header>
    </div>
  );
}

export default App;
