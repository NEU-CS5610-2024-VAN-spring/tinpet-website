import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import { useNavigate } from "react-router-dom";

export function VerifyUser() {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const { accessToken } = useAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      if (accessToken) {
        try {
          const response = await fetch(
            "https://assignment-03-77.onrender.com/api/verify-user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            navigate("/");
          } else {
            console.error("Error verifying user:", await response.text());
          }
        } catch (error) {
          console.error("Network or other error:", error);
        }
      }
    };

    if (isAuthenticated) {
      verifyUser();
    } else {
      loginWithRedirect();
    }
  }, [isAuthenticated, accessToken, loginWithRedirect, navigate]);

  if (!isAuthenticated) {
    return <div className="loading">Redirecting to login...</div>;
  } else if (!accessToken) {
    return <div className="loading">Obtaining access token...</div>;
  } else {
    return <div className="loading">Verifying user...</div>;
  }
}

export default VerifyUser;
