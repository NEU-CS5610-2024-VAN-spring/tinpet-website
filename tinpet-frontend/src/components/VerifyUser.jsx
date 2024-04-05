import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext"; // Adjust the import path as necessary
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
            "http://localhost:8000/api/verify-user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            navigate("/"); // Navigate to home page on successful verification
          } else {
            // Handle server errors or unsuccessful verification
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

  // Optional: You might want to show different content based on the authentication/loading state
  if (!isAuthenticated) {
    return <div className="loading">Redirecting to login...</div>;
  } else if (!accessToken) {
    return <div className="loading">Obtaining access token...</div>;
  } else {
    return <div className="loading">Verifying user...</div>;
  }
}

export default VerifyUser;
