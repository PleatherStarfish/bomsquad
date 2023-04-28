import React from "react";

const VersionHistory = () => {
  return (
    <div className="mt-8">
      <Link
        to=".."
        relative="path"
        className="flex gap-2 items-center text-gray-400"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Account</span>
      </Link>
      <h1 className="text-gray-700 text-3xl font-bold mb-12 mt-5">
        Version History
      </h1>
    </div>
  );
};

export default VersionHistory;
