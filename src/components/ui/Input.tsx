import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-primary-900">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm text-primary-950 shadow-sm outline-none placeholder:text-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      />
    </div>
  );
}
