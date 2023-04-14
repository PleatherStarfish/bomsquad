import React from "react";
import cx from "classnames";

export const ButtonVariant = {
  warning: "bg-yellow-100 text-yellow-800", 
  muted: "bg-gray-100 text-gray-500",
  
};

const Alert = ({ variant = "muted", children }) => {
  return (
    <div className={cx("p-6 rounded", ButtonVariant[variant])} role="alert">
      {children}
    </div>
  );
};

export default Alert;
