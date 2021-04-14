import React from "react";
import Button from "../styles/Auth";
import { SignInIcon } from "./Icons";
import { GoogleLogin } from "react-google-login";
import { authenticate } from "utils/api-client";

function GoogleAuth() {
  return (
    <GoogleLogin
      clientId="858366239741-1vc4v0ip68ca169boe6m94jpnltqov97.apps.googleusercontent.com"
      cookiePolicy="single_host_origin"
      onSuccess={authenticate}
      onFailure={authenticate}
      render={(renderProps) => (
        <Button
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
          tabIndex={0}
          type="button"
        >
          <span className="outer">
            <span className="inner">
              <SignInIcon />
            </span>
            sign in
          </span>
        </Button>
      )}
    />
  );
}

export default GoogleAuth;
