import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 bg-ctp-surface0 border border-border rounded-md text-foreground placeholder-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-ctp-red focus:ring-ctp-red" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-ctp-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
