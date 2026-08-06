import React, { createContext, useContext, useState } from "react";
const SelectCtx = createContext();
export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  return <SelectCtx.Provider value={{ value, onValueChange, open, setOpen }}><div className="relative">{children}</div></SelectCtx.Provider>;
};
export const SelectTrigger = ({ children, className = "" }) => {
  const { open, setOpen } = useContext(SelectCtx);
  return <button type="button" onClick={() => setOpen(!open)} className={`flex h-9 w-full items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 ${className}`}>{children}</button>;
};
export const SelectValue = ({ placeholder }) => { const { value } = useContext(SelectCtx); return <span>{value || placeholder}</span>; };
export const SelectContent = ({ children }) => { const { open } = useContext(SelectCtx); return open ? <div className="absolute top-full mt-1 w-full rounded-md border border-slate-800 bg-slate-900 shadow-xl z-50 p-1">{children}</div> : null; };
export const SelectItem = ({ value, children }) => {
  const { onValueChange, setOpen } = useContext(SelectCtx);
  return <div onClick={() => { onValueChange(value); setOpen(false); }} className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-slate-800 text-slate-200">{children}</div>;
};