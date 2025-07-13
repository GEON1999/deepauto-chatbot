'use client';

import React from 'react';
import { InputProps } from '@/lib/types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  required = false,
  className = '',
}) => {
  const baseStyles = 'block w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50';

  const errorStyles = error
    ? 'border-red-500/50 text-red-400 placeholder-red-400/70 focus:border-red-500 focus:ring-red-500'
    : 'border-neutral-800 bg-neutral-900 text-neutral-200 placeholder-neutral-500 focus:border-neutral-700 focus:ring-neutral-700';
  
  const inputStyles = `${baseStyles} ${errorStyles} ${className}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputStyles}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
