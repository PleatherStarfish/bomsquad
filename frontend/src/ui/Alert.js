import { InformationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";
import cx from "classnames";

export const AlertVariant = {
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-50 text-blue-700",
  muted: "bg-gray-100 text-gray-500",
  transparent: "bg-transparent text-gray-500",
};

export const AlertVariantPadding = {
  normal: "p-6",
  compact: "p-3",
};

export const AlertVariantIcon = {
  info: (
    <div className="flex-shrink-0">
      <InformationCircleIcon
        className="w-5 h-5 text-blue-400"
        aria-hidden="true"
      />
    </div>
  ),
};

const Alert = ({
  variant = "muted",
  icon = false,
  padding = "normal",
  centered = false,
  children,
}) => {
  return (
    <div className={cx("p-6 rounded w-full", AlertVariant[variant], AlertVariantPadding[padding])} role="alert">
      <div className="flex w-full">
        {icon && AlertVariantIcon[variant]}
        <div className={cx("flex-1 ml-3 md:flex", {"md:justify-between": !centered, "justify-center": centered})}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Alert;
