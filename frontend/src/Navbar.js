import React, { useState } from 'react';
import MobileMenu from './MobileMenu';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

  const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  
  const { data: user, isLoading, isError } = useQuery(["authenticatedUser"], async () => {
    const response = await axios.get("/api/get-user-me/", {
      withCredentials: true,
    });
    return response.data;
  });

  const toggleMobileMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full bg-[#212529] z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <ul className="flex space-x-4 text-white">
                <li>
                  <a href="/" className="nav-link px-2 text-secondary">Home</a>
                </li>
                <li>
                  <a href="/about/" className="nav-link px-2">About</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            <div className="relative text-end">
              {/* toggle button */}
              <button
                id="menu-button"
                className="block text-white text-decoration-none focus:outline-none"
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : 'false'}
                onClick={toggleMobileMenu}
              >
                {/* {user.is_authenticated ? user.email : 'Menu'} */}
              </button>
              {/* mobile menu */}
              {isMenuOpen && (
                <MobileMenu
                  onLinkClick={() => setMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar