import React from "react";
import cx from "classnames";

export const ButtonSize = {
  xs: "rounded px-2 py-1 text-xs",
  sm: "rounded px-2 py-1 text-sm",
  md: "rounded-md px-2.5 py-1.5 text-sm",
  lg: "rounded-md px-3 py-2 text-sm",
  xl: "rounded-md px-3.5 py-2.5 text-sm"
}

export const ButtonVariant = {
  primary: "bg-[#548a6a] text-white",
  submit: "bg-blue-500 text-white",
  muted: "bg-gray-400 text-white hover:bg-gray-300",
  light: "bg-white border-2 border-gray-400 text-gray-500 hover:border-gray-300 hover:text-gray-400"
}

const Button = ({ size = "md", variant = 'primary', onClick, classNames, Icon, iconLocation = 'left', children }) => {
  return (
      <button
        type="button"
        onClick={onClick}
        className={cx("flex gap-2 font-semibold h-min whitespace-nowrap	", ButtonSize[size], ButtonVariant[variant], classNames)}
      >
        {iconLocation === 'left' && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {iconLocation === 'right' && <Icon className="w-4 h-4" />}
      </button>
  );
};

export default Button;
