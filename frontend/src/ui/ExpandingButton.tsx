import "tippy.js/dist/tippy.css";

import React, { FC, ReactNode } from "react";
import Tippy from "@tippyjs/react";
import cx from "classnames";

// Reuse styles from Button.tsx
import { ButtonSizeIconOnlyMap, ButtonVariantMap, ButtonSizeIconSizeMap } from "./Button";

type ButtonSize = "lg" | "md" | "sm" | "xl" | "xs";
type ButtonVariant =
  | "danger"
  | "light"
  | "link"
  | "linkBlue"
  | "muted"
  | "mutedHoverPrimary"
  | "none"
  | "primary"
  | "submit";

interface ExpandingButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: () => void;
  classNames?: string;
  Icon?: FC<{ className?: string }>;
  tooltipText?: string;
  children?: ReactNode;
}

const ExpandingButton: FC<ExpandingButtonProps> = ({
  size = "md",
  variant = "primary",
  onClick,
  classNames = "",
  Icon,
  tooltipText,
  children,
}) => {
  const sizeClass = ButtonSizeIconOnlyMap[size];
  const variantClass = ButtonVariantMap[variant];

  return (
    <Tippy content={tooltipText} disabled={!tooltipText}>
      <button
        aria-label={children ? children.toString() : ""}
        className={cx(
          "flex items-center justify-center group transition-all duration-700 overflow-hidden",
          sizeClass,
          variantClass,
          classNames,
          "w-auto min-w-[2.5rem] max-w-fit px-2 group-hover:px-4"
        )}
        onClick={onClick}
        style={{ transition: "width 0.7s ease, padding 0.7s ease" }}
        type="button"
      >
        {Icon && <Icon className={cx(ButtonSizeIconSizeMap[size], "group-hover:mr-2 transition-all duration-200")} />}
        <span className="hidden transition-opacity duration-700 opacity-0 group-hover:opacity-100 whitespace-nowrap group-hover:inline">
          {children}
        </span>
      </button>
    </Tippy>
  );
};

export default ExpandingButton;
