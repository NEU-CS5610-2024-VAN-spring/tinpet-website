import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function NavigationBar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex justify-between items-center text-white">
        <li>
          <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/details"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Details
          </Link>
        </li>
        <li>
          <Link to="/profile" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">
            Profile
          </Link>
        </li>
        <li>
            <Link to="/matches" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400">
                Matches
            </Link>
        </li>
        {isAuthenticated ? (
          <li>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
            >
              Logout
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={() => loginWithRedirect()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
            >
              Login
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavigationBar;