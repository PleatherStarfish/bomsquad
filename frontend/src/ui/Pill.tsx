import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import React, { ReactNode } from "react";
import cx from "classnames";

// Define the prop types
interface PillProps {
  color?: string;
  border?: string;
  textColor?: string;
  textSize?: string;
  showArrow?: boolean;
  showXMark?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const Pill: React.FC<PillProps> = ({
  color = "bg-slate-500",
  border = "border-slate-500",
  textColor = "text-white",
  textSize = "text-xs",
  showArrow = true,
  children,
}) => {
  return (
    <li className="flex my-0.5">
      <div
        className={cx(
          "flex pt-1 pb-1 pl-2 pr-2 no-underline rounded-full font-sans font-semibold btn-primary",
          border,
          color,
          textColor,
          textSize
        )}
      >
        {children}
      </div>
      {showArrow && (
        <div className="flex flex-col justify-center h-full">
          <ArrowLongRightIcon className="w-5 h-5" />
        </div>
      )}
    </li>
  );
};

export default Pill;
