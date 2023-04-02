import React from "react";
import cx from "classnames";

export const ButtonSize = {
  'xs': "rounded px-2 py-1 text-xs",
  'sm': "rounded px-2 py-1 text-sm",
  'md': "rounded-md px-2.5 py-1.5 text-sm",
  'lg': "rounded-md px-3 py-2 text-sm",
  'xl': "rounded-md px-3.5 py-2.5 text-sm"
}

export const ButtonVariant = {
  'primary': "bg-[#548a6a] text-white",
  'submit': "bg-blue-500 text-white",
  'muted': "bg-gray-400 text-black",
}

const Button = ({ size = "md", variant = 'primary', onClick, classNames, children }) => {
  return (
      <button
        type="button"
        onClick={onClick}
        className={cx("font-semibold h-min whitespace-nowrap	", ButtonSize[size], ButtonVariant[variant], classNames)}
      >
        {children}
      </button>
  );
};

export default Button;
