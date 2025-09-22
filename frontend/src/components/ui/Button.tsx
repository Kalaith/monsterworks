/**
 * Button component following the design system
 */

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'base' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'base',
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-fast ease-standard',
    'border border-transparent rounded',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  ];

  const variantClasses = {
    primary: [
      'bg-primary text-white',
      'hover:bg-primary-hover active:bg-primary-active',
      'shadow-sm hover:shadow-md'
    ],
    secondary: [
      'bg-secondary text-text',
      'hover:bg-secondary-hover active:bg-secondary-active',
      'border-border'
    ],
    outline: [
      'bg-transparent text-primary',
      'border-primary hover:bg-primary hover:text-white',
      'active:bg-primary-active'
    ]
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    base: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        ...baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}