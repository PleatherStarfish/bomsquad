import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="px-4 py-8 mb-12 mt-36 md:px-24 lg:px-48 grow">
      <h1 className="mb-6 text-2xl">Oops! Page Not Found.</h1>

      <p>
        We&apos;re sorry, but it seems like the page you&apos;re looking for can&apos;t be
        found. It may have been moved, deleted, or never existed in the first
        place.
      </p>

      <p>
        Try checking the URL for errors, then hit the refresh button on your
        browser.
      </p>
    </div>
  );
};

export default NotFound;
