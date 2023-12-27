import { ArrowLongRightIcon, XMarkIcon } from "@heroicons/react/24/solid";

import React from "react";
import cx from "classnames";

const Pill = ({ color = "bg-slate-500", border = "border-slate-500", textColor = "text-white", textSize = "text-xs", showArrow = true, showXMark = true, onClick, children }) => {
  return (
    <li className="flex my-0.5">
      <div
        className={cx(
          "flex py-0.5 px-1.5 no-underline rounded-full font-sans font-semibold btn-primary",
          border,
          color,
          textColor,
          textSize // Apply the textSize class here
        )}
      >
        {children}
        {showXMark && <XMarkIcon
          className="w-4 h-4 fill-white"
          onClick={onClick}
          role="button"
        />}
      </div>
      {showArrow && <ArrowLongRightIcon className="w-5 h-5" />}
    </li>
  );
};

export default Pill;