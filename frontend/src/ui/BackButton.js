import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { Link } from "react-router-dom";
import React from "react";

const BackButton = ({prevPageName, prevPagePath = ".."}) => {
  return (
    <Link
      to={prevPagePath}
      relative="path"
      className="flex items-center gap-2 text-gray-400"
    >
      <ChevronLeftIcon className="w-5 h-5" />
      <span>Back to {prevPageName}</span>
    </Link>
  );
};

export default BackButton;
