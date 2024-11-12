import "tippy.js/dist/tippy.css";

import React, { FC, ReactNode } from "react";

import Tippy from "@tippyjs/react";
import cx from "classnames";

// Define enums or types for sizes and variants
type ButtonSize = "lg" | "md" | "sm" | "xl" | "xs";
type ButtonVariant =
  "danger" | "light" | "link" | "linkBlue" | "muted" | "mutedHoverPrimary" | "none" | "primary" | "submit";
type IconLocation = "left" | "right";

// Style mappings with string enums
export const ButtonSizeMap: Record<ButtonSize, string> = {
  lg: "rounded-md px-3 py-2 text-sm",
  md: "rounded-md px-2.5 py-1.5 text-sm",
  sm: "rounded px-2 py-1 text-sm",
  xl: "rounded-md px-3.5 py-2.5 text-sm",
  xs: "rounded px-2 py-1 text-xs",
};

export const ButtonSizeIconOnlyMap: Record<ButtonSize, string> = {
  lg: "rounded-md p-3",
  md: "rounded-md p-2.5",
  sm: "rounded p-2",
  xl: "rounded-md p-3.5",
  xs: "rounded p-1.5",
};

export const ButtonSizeIconSizeMap: Record<ButtonSize, string> = {
  lg: "w-6 h-6",
  md: "w-5 h-5",
  sm: "w-4 h-4",
  xl: "w-7 h-7",
  xs: "w-3 h-3",
};

export const ButtonVariantMap: Record<ButtonVariant, string> = {
  danger: "bg-red-500 hover:bg-red-700 text-white",
  light:
    "bg-white border-2 border-gray-400 text-gray-500 hover:border-gray-600 hover:text-gray-700",
  link: "text-gray-500 hover:text-red-500",
  linkBlue: "text-blue-500 hover:text-blue-700",
  muted: "bg-gray-400 text-white hover:bg-gray-500",
  mutedHoverPrimary: "bg-gray-400 text-white hover:bg-[#548a6a]",
  none: "text-white",
  primary: "bg-[#548a6a] hover:bg-[#406a4c] text-white",
  submit: "bg-blue-500 hover:bg-blue-700 text-white",
};

// Define props with TypeScript
interface ButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: () => void;
  classNames?: string;
  Icon?: FC<{ className?: string }>; // Define Icon as a component with className prop
  Image?: string; // URL of the image
  imageAlt?: string;
  iconLocation?: IconLocation;
  iconOnly?: boolean;
  tooltipText?: string;
  children?: ReactNode;
}

// Main Button component
const Button: FC<ButtonProps> = ({
  size = "md",
  variant = "primary",
  onClick,
  classNames = "",
  Icon,
  Image,
  imageAlt = "",
  iconLocation = "left",
  iconOnly = false,
  tooltipText,
  children,
}) => {
  const sizeClass = iconOnly ? ButtonSizeIconOnlyMap[size] : ButtonSizeMap[size];
  const variantClass = ButtonVariantMap[variant];

  // Render button for icon only
  if (iconOnly && Icon) {
    return (
      <Tippy content={tooltipText} disabled={!tooltipText}>
        <button
          aria-label={children ? children.toString() : ""}
          className={cx(
            "flex items-center justify-center",
            sizeClass,
            variantClass,
            classNames
          )}
          onClick={onClick}
          type="button"
        >
          <Icon className="w-4 h-4" />
        </button>
      </Tippy>
    );
  }

  // Render button with optional icon and image
  return (
    <button
      className={cx(
        "flex gap-2 font-semibold h-min whitespace-nowrap items-center",
        sizeClass,
        variantClass,
        classNames
      )}
      onClick={onClick}
      type="button"
    >
      {Icon && iconLocation === "left" && <Icon className="w-4 h-4" />}
      {Image && iconLocation === "left" && (
        <img alt={imageAlt} className="h-5 w-fit" src={Image} />
      )}
      <span>{children}</span>
      {Icon && iconLocation === "right" && <Icon className="w-4 h-4" />}
      {Image && iconLocation === "right" && (
        <img alt={imageAlt} className="h-5 w-fit" src={Image} />
      )}
    </button>
  );
};

export default Button;
