'use client';

import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export default function Checkbox({ label, checked, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 text-sm text-foreground cursor-pointer ${className}`}>
      <input type="checkbox" className="sr-only" checked={checked} {...props} />
      <span
        className={`h-5 w-5 rounded border-2 border-primary/70 flex items-center justify-center transition-colors ${
          checked ? 'bg-primary border-primary' : 'bg-white'
        }`}
      >
        {checked && (
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.493-6.494a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}
