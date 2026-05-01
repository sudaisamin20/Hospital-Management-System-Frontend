import React from "react";

interface Props {
  text?: string;
  loadingText?: string;
  isLoading?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const LoadingButton = ({
  text = "Submit",
  loadingText = "Processing...",
  isLoading = false,
  type = "button",
  className = "",
}: Props) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-white
        bg-indigo-600 hover:bg-indigo-700
        transition-all duration-200
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}

      {isLoading ? loadingText : text}
    </button>
  );
};

export default LoadingButton;
