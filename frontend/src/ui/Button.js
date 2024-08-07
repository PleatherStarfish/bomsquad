import "tippy.js/dist/tippy.css";

import React from "react";
import Tippy from "@tippyjs/react";
import cx from "classnames";

export const ButtonSize = {
  xs: "rounded px-2 py-1 text-xs",
  sm: "rounded px-2 py-1 text-sm",
  md: "rounded-md px-2.5 py-1.5 text-sm",
  lg: "rounded-md px-3 py-2 text-sm",
  xl: "rounded-md px-3.5 py-2.5 text-sm",
};

export const ButtonSizeIconOnly = {
  xs: "rounded p-1.5",
  sm: "rounded p-2",
  md: "rounded-md p-2.5",
  lg: "rounded-md p-3",
  xl: "rounded-md p-3.5",
};

export const ButtonSizeIconSize = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

export const ButtonVariant = {
  primary: "bg-[#548a6a] hover:bg-[#406a4c] text-white",
  danger: "bg-red-500 hover:bg-red-700 text-white",
  submit: "bg-blue-500 hover:bg-blue-700 text-white",
  muted: "bg-gray-400 text-white hover:bg-gray-500",
  mutedHoverPrimary: "bg-gray-400 text-white hover:bg-[#548a6a]",
  light:
    "bg-white border-2 border-gray-400 text-gray-500 hover:border-gray-600 hover:text-gray-700",
  link: "text-gray-500 hover:text-red-500",
  linkBlue: "text-blue-500 hover:text-blue-700"
};

const Button = ({
  size = "md",
  variant = "primary",
  onClick,
  classNames = "",
  Icon = undefined,
  Image = undefined,
  imageAlt = "",
  iconLocation = "left",
  iconOnly = false,
  tooltipText,
  children,
}) => {
  const sizeClass = iconOnly ? ButtonSizeIconOnly[size] : ButtonSize[size];
  const variantClass = ButtonVariant[variant];

  if (iconOnly && Icon) {
    return (
      <Tippy content={tooltipText} disabled={!tooltipText}>
        <button
          type="button"
          onClick={onClick}
          className={cx(
            "flex items-center justify-center",
            sizeClass,
            variantClass,
            classNames
          )}
          aria-label={children}
        >
          <Icon className="w-4 h-4" />
        </button>
      </Tippy>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex gap-2 font-semibold h-min whitespace-nowrap items-center",
        sizeClass,
        variantClass,
        classNames
      )}
    >
      {Icon && iconLocation === "left" && <Icon className="w-4 h-4" />}
      {Image && iconLocation === "left" && <img src={Image} alt={imageAlt} className="h-5 w-fit" />}
      <span>{children}</span>
      {Icon && iconLocation === "right" && <Icon className="w-4 h-4" />}
      {Image && iconLocation === "right" && <img src={Image} alt={imageAlt} className="h-5 w-fit" />}
    </button>
  );
};

export default Button;
