import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp, viewportOnce } from '@/lib/animations';
import { bodyLead, gradientHeading, headingXl } from '@/lib/styles';

interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  highlight?: string;
  titleAfter?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  highlight,
  titleAfter,
  subtitle,
  align = 'center',
  className,
  titleClassName,
  subtitleClassName,
}) => {
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <motion.div
      className={cn('mb-8 sm:mb-12 max-w-3xl', alignClasses, className)}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {eyebrow && (
        <div className="mb-3 text-xs sm:text-sm uppercase tracking-wider text-emerald-600 font-medium">
          {eyebrow}
        </div>
      )}
      <h2 className={cn(headingXl, 'mb-3 sm:mb-4', titleClassName)}>
        {title}
        {highlight && (
          <>
            {' '}
            <span className={gradientHeading}>{highlight}</span>
          </>
        )}
        {titleAfter && <> {titleAfter}</>}
      </h2>
      {subtitle && <p className={cn(bodyLead, subtitleClassName)}>{subtitle}</p>}
    </motion.div>
  );
};

export default SectionHeader;
