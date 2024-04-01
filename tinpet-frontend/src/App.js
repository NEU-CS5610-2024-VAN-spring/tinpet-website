import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import VerifyUser from "./components/VerifyUser";
import DetailsPage from "./components/DetailsPage";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";

const requestedScopes = ["profile", "email"];

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/verify-user" replace />;
  }

  return children;
}

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/profile`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route path="/verify-user" element={<VerifyUser />} />
            <Route path="/details/:identifier" element={<DetailsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  );
}

export default App;
