import React from 'react';
import { cn } from '@/lib/utils';
import { cardSurface, cardSurfaceMuted } from '@/lib/styles';

type CardVariant = 'solid' | 'muted';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'solid',
  padded = true,
  interactive = false,
  className,
  children,
  ...props
}) => {
  const base = variant === 'muted' ? cardSurfaceMuted : cardSurface;
  return (
    <div
      className={cn(
        base,
        padded && 'p-5 sm:p-6 md:p-8',
        interactive && 'hover:-translate-y-0.5 hover:shadow-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
