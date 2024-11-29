import React from "react";
import Tippy from "@tippyjs/react";

interface RowWarningProps {
  user_submitted_status: string;
  id: string;
  left?: string;
  children: any;
}

export const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
};

const RowWarning: React.FC<RowWarningProps> = ({
  id,
  left = "-37px",
  user_submitted_status,
  children,
}) => {
  return (
    <div className="relative">
      {user_submitted_status === "pending" && (
        <Tippy content="This component is a user submission. User submissions are reviewed for accuracy and relevance, typically within 24 hours.">
          <div
            className="flex justify-center align-middle text-2xl"
            style={{
              backgroundColor: "#db2777",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "8px",
              fontWeight: "bold",
              height: "20px",
              left: left,
              overflow: "visible",
              padding: "0.1rem 0.1rem",
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%) rotate(-90deg)",
              whiteSpace: "nowrap",
              width: "45px",
              zIndex: 1,
            }}
          >
            <div style={{ transform: "translateY(-45%)" }}>verifying</div>
          </div>
        </Tippy>
      )}
      <a
        className="text-blue-500 hover:text-blue-700"
        href={`${getBaseUrl()}/components/${id}`}
      >
        {children}
      </a>
    </div>
  );
};

export default RowWarning;
