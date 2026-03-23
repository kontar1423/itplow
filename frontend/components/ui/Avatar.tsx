'use client';

import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Avatar({ 
  className = '', 
  src, 
  alt = 'Avatar', 
  fallback,
  size = 'md',
  ...props 
}: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };
  
  const initials = fallback || '?';
  
  return (
    <div 
      className={`
        relative inline-flex items-center justify-center 
        rounded-full bg-primary-light text-primary-dark 
        font-semibold overflow-hidden
        ${sizes[size]} ${className}
      `}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
