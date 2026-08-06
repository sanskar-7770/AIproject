import React from "react";
export const Button = ({ children, className = "", ...props }) => (
  <button className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 ${className}`} {...props}>{children}</button>
);