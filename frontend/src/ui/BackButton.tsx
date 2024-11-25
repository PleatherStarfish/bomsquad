import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { Link } from "react-router-dom";
import React from "react";

interface BackButtonProps {
  prevPageName: string;
  prevPagePath?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ prevPageName, prevPagePath = ".." }) => {
  return (
    <Link
      className="flex items-center gap-2 text-gray-400"
      relative="path"
      to={prevPagePath}
    >
      <ChevronLeftIcon className="w-5 h-5" />
      <span>Back to {prevPageName}</span>
    </Link>
  );
};

export default BackButton;
