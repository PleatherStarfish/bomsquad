import React from 'react';

const Footer = () => {
  return (
    <div className="py-10 px-48 grid grid-cols-3 gap-4 w-screen bg-gray-50">
      <div>
        <h1 className="font-semibold text-gray-900 mb-1">About</h1>
        <ul className="list-none text-sm text-gray-600">
          <li>
            <a href="#" className="text-gray-400 hover:text-gray-700">FAQ</a>
          </li>
          <li>
            <a href="#" className="text-gray-400 hover:text-gray-700">Terms of Service</a>
          </li>
          <li>
            <a href="#" className="text-gray-400 hover:text-gray-700">Privacy Policy</a>
          </li>
        </ul>
      </div>
      <div>
        <div>
          <h1 className="font-semibold text-gray-900 mb-1">Account</h1>
          <ul className="list-none text-sm text-gray-600">
            <li>
              <a href="#" className="text-gray-400 hover:text-gray-700">Login</a>
            </li>
          </ul>
        </div>
        <div>
          <h1 className="sr-only">Contact</h1>
          <ul className="list-none text-sm text-gray-600">
            <li>
              <a href="mailto:info@bom-squad.com" className="text-gray-400 hover:text-gray-700 mt-4">Contact</a>
            </li>
          </ul>
        </div>
      </div>
      <div></div>
      <div>
        <h1 className="font-semibold text-gray-900 mb-1">Support</h1>
        <ul className="list-none text-sm text-gray-600">
          <li>
            <a href="#" className="text-gray-400 hover:text-gray-700">Donate</a>
          </li>
          <li>
            <a href="#" className="text-gray-400 hover:text-gray-700">Contribute to the project on GitHub</a>
          </li>
        </ul>
      </div>
      <div>
        <div>
          <a href="https://www.itsnicethat.com/news/resources-supporting-black-lives-matter-movement-creative-industry-010620"
             target="_blank"
             className="text-gray-400 hover:text-gray-700">Black lives matter.</a>
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default Footer;
