import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function NavigationBar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="text-white inline-block md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Icon for menu */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          {/* Logo or brand name could go here */}
        </div>
        <ul className={`flex-col md:flex-row md:flex space-x-0 md:space-x-6 mt-4 md:mt-0 ${isMenuOpen ? 'flex' : 'hidden'}`}>
          <li>
            <Link
              to="/"
              className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/details"
              className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Details
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/matches"
              className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Matches
            </Link>
          </li>
          <li>
            <Link
              to="/authdebugger"
              className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
            >
              AuthDebugger
            </Link>
          </li>
          {isAuthenticated ? (
            <li>
              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <button
                onClick={loginWithRedirect}
                className="block bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
              >
                Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavigationBar;
