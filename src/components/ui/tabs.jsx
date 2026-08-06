import React from "react";
export const Tabs = ({ children, defaultValue }) => <div>{children}</div>;
export const TabsList = ({ children }) => <div className="flex space-x-2 border-b border-slate-800">{children}</div>;
export const TabsTrigger = ({ children, value }) => <button className="px-4 py-2 text-sm font-medium text-slate-400">{children}</button>;
export const TabsContent = ({ children }) => <div>{children}</div>;