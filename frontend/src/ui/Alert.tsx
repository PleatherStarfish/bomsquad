import { ConeStriped, Shuffle } from "react-bootstrap-icons";
import React, { ReactNode } from "react";

import { InformationCircleIcon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import cx from "classnames";

export const AlertVariant = {
  addComponent: "bg-transparent text-sky-500 hover:bg-sky-200 hover:text-blue-700 rounded-lg",
  info: "bg-blue-50 text-blue-700",
  muted: "bg-gray-100 text-gray-500",
  sky: "bg-sky-200 text-blue-900",
  transparent: "bg-transparent text-gray-500",
  underConstruction: "bg-yellow-100 text-yellow-800",
  warning: "bg-yellow-100 text-yellow-800",
} as const;

export const AlertVariantPadding = {
  compact: "p-3",
  normal: "p-6",
} as const;

export const AlertVariantIcon = {
  addComponent: (
    <div className="flex-shrink-0">
      <SquaresPlusIcon aria-hidden="true" className="w-5 h-5 text-sky-500 group-hover:text-blue-700" />
    </div>
  ),
  info: (
    <div className="flex-shrink-0">
      <InformationCircleIcon aria-hidden="true" className="w-5 h-5 text-blue-400" />
    </div>
  ),
  sky: (
    <div className="flex-shrink-0" style={{ paddingTop: "2px" }}>
      <Shuffle aria-hidden="true" className="w-5 h-5 text-blue-900" />
    </div>
  ),
  underConstruction: (
    <div className="flex-shrink-0">
      <ConeStriped aria-hidden="true" className="w-6 h-6 text-yellow-800" />
    </div>
  ),
} as const;

export const AlertAlignment = {
  around: "justify-around",
  between: "justify-between",
  center: "justify-center",
  end: "justify-end",
  start: "justify-start",
} as const;

type AlertProps = {
  variant?: keyof typeof AlertVariant;
  icon?: boolean;
  padding?: keyof typeof AlertVariantPadding;
  align?: keyof typeof AlertAlignment;
  expand?: boolean;
  children: ReactNode;
};

const Alert: React.FC<AlertProps> = ({
  variant = "muted",
  icon = false,
  padding = "normal",
  align = "between",
  expand = true,
  children,
}) => {
  const isAddComponentVariant = variant === "addComponent";

  return (
    <div
      className={cx(
        "rounded w-full",
        AlertVariant[variant],
        AlertVariantPadding[padding],
        { group: isAddComponentVariant } // Add group only for addComponent
      )}
      role="alert"
    >
      <div className={cx("flex w-full", AlertAlignment[align])}>
        {icon && (
          <div
            className={cx({
              "flex-shrink-0 text-sky-500 group-hover:text-blue-700": isAddComponentVariant,
            })}
          >
            {AlertVariantIcon[variant]}
          </div>
        )}
        <div
          className={cx({
            "flex-1": expand,
            "ml-3": icon,
            "group-hover:text-blue-700": isAddComponentVariant,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Alert;