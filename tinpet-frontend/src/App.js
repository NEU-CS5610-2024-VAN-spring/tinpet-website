import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import VerifyUser from "./components/VerifyUser";
import DetailsPage from "./components/DetailsPage";
import AuthDebugger from "./components/AuthDebugger";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import { PostLoginRedirect } from "./components/PostLoginRedirect";
import MatchesPage from "./components/MatchesPage";

const requestedScopes = ["openid", "profile", "email"];

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
        redirect_uri: `${window.location.origin}`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <NavigationBar />
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
            <Route
              path="/details/:petId"
              element={
                <RequireAuth>
                  <DetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/details"
              element={
                <RequireAuth>
                  <DetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/matches"
              element={
                <RequireAuth>
                  <MatchesPage />
                </RequireAuth>
              }
            />
            <Route path="/authdebugger" element={
                <RequireAuth>
                    <AuthDebugger />
                </RequireAuth>
                } />    
          </Routes>
          <PostLoginRedirect />
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  );
}

export default App;
