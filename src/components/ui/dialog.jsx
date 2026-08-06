import React from "react";
export const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">{children}</div> : null;
export const DialogContent = ({ children, className = "" }) => <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-slate-100 shadow-2xl ${className}`}>{children}</div>;
export const DialogHeader = ({ children }) => <div className="space-y-1.5 mb-4">{children}</div>;
export const DialogTitle = ({ children }) => <h2 className="text-lg font-bold text-white">{children}</h2>;
export const DialogDescription = ({ children }) => <p className="text-xs text-slate-400">{children}</p>;
export const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-4">{children}</div>;