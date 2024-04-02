import { useEffect } from "react";
import { useAuthToken } from "../AuthTokenContext";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// export default function VerifyUser() {
//   const navigate = useNavigate();
//   const { accessToken } = useAuthToken();
//   const { isAuthenticated, loginWithRedirect } = useAuth0();

//   useEffect(() => {
//     async function verifyUser() {
//         const data = await fetch(
//           `${process.env.REACT_APP_API_URL}/verify-user`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );
//         const user = await data.json();

//         if (user.auth0Id) {
//           navigate("/profile");
//         } else {
//           loginWithRedirect();
//         }
//     }

//     if (accessToken) {
//       verifyUser();
//     }
//     else if (!isAuthenticated) {
//       loginWithRedirect();
//     }
//   }, [accessToken, navigate, loginWithRedirect, isAuthenticated]);

export function VerifyUser() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { accessToken } = useAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else if (accessToken) {
      navigate("/");
    }
  }, [isAuthenticated, accessToken, loginWithRedirect, navigate]);

  return <div className="loading">Loading...</div>;
}

export default VerifyUser;
