import React from "react";
export const Progress = ({ value = 0, className = "" }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
    <div className="h-full bg-sky-500 transition-all" style={{ width: `${value}%` }} />
  </div>
);