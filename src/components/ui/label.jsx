import React from "react";
export const Label = ({ children, className = "" }) => <label className={`text-xs font-medium text-slate-300 ${className}`}>{children}</label>;