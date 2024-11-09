import { InformationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";
import { Shuffle } from "react-bootstrap-icons";
import cx from "classnames";

export const AlertVariant = {
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-50 text-blue-700",
  sky: "bg-sky-200 text-blue-900",
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
      <InformationCircleIcon className="w-5 h-5 text-blue-400" aria-hidden="true" />
    </div>
  ),
  sky: (
    <div className="flex-shrink-0" style={{paddingTop: "2px"}}>
      <Shuffle className="w-5 h-5 text-blue-900" aria-hidden="true" />
    </div>
  ),
};

// Alignment options for extensibility
export const AlertAlignment = {
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  start: "justify-start",
  end: "justify-end",
};

const Alert = ({
  variant = "muted",
  icon = false,
  padding = "normal",
  align = "between",
  expand = true,
  children,
}) => {
  return (
    <div
      className={cx("rounded w-full", AlertVariant[variant], AlertVariantPadding[padding])}
      role="alert"
    >
      <div className={cx("flex w-full", AlertAlignment[align])}>
        {icon && AlertVariantIcon[variant]}
        <div className={cx({ "flex-1": expand, "ml-3": icon })}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Alert;
