import React from "react";
export const Card = ({ children, className = "" }) => <div className={`rounded-xl border border-slate-800 bg-[#0f172a]/60 text-slate-100 shadow-xl ${className}`}>{children}</div>;
export const CardHeader = ({ children, className = "" }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
export const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
export const CardDescription = ({ children, className = "" }) => <p className={`text-sm text-slate-400 ${className}`}>{children}</p>;
export const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;