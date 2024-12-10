import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function PostLoginRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      const petId = sessionStorage.getItem("postLoginRedirectPetId");
      if (petId) {
        navigate(`/details/${petId}`);
        sessionStorage.removeItem("postLoginRedirectPetId");
      }
    }
  }, [isAuthenticated, navigate]);

  return null;
}

export default PostLoginRedirect;
