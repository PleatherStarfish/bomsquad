import React from 'react';

const MobileMenu = () => {
  return (
    <div className="sm:hidden" id="mobile-menu">
      <div className="space-y-1 px-2 pt-2 pb-3">
        <a href="http://localhost:8000/" className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" aria-current="page">Home</a>
        <a href="http://localhost:8000/about/" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">About</a>
      </div>
    </div>
  );
}

export default MobileMenu
