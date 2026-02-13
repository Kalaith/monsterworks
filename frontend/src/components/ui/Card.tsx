/**
 * Card component following the design system
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  const baseClasses =
    'bg-surface rounded-lg border border-card-border transition-all duration-normal ease-standard';

  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md hover:shadow-lg',
    interactive: 'shadow-sm hover:shadow-md cursor-pointer hover:border-primary',
  };

  const combinedClassName = cn(baseClasses, variantClasses[variant], className);

  if (variant === 'interactive') {
    return (
      <motion.div
        className={combinedClassName}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-border', className)} {...props}>
      {children}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-border', className)} {...props}>
      {children}
    </div>
  );
}
