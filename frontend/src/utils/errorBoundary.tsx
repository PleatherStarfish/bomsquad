import React from "react";
import * as Sentry from "@sentry/react";

const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center w-full max-w-md p-6 mx-auto space-y-6 bg-white border border-gray-200 rounded-lg">
    <h2 className="text-2xl font-semibold text-gray-800">
      Something went wrong
    </h2>
    <p className="text-sm text-red-600">{error.message}</p>
    <button
      className="px-4 py-2 text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
      onClick={resetErrorBoundary}
    >
      Try Again
    </button>
    <p className="text-sm text-gray-700">
      If this issue persists, please help us by reporting it:
    </p>
    <a
      className="text-sm font-medium text-blue-600 hover:underline"
      href="https://github.com/PleatherStarfish/bomsquad/issues/"
      rel="noopener noreferrer"
      target="_blank"
    >
      Report a Bug
    </a>
  </div>
);

const CustomErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetError} />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default CustomErrorBoundary;