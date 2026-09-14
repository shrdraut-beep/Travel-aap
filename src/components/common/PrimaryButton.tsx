import React from 'react';
import { Loader2 } from 'lucide-react';

export interface PrimaryButtonProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ElementType | React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'pink' | 'orange' | 'rose' | 'sky';
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  children,
  onClick,
  icon: Icon,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  variant = 'pink',
  fullWidth = false,
}) => {
  const variantClasses = {
    pink: 'bg-[var(--premium-pink)] hover:opacity-90 text-white shadow-pink-100/50',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100/50',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100/50',
    sky: 'bg-[var(--premium-sky-deep)] hover:bg-sky-700 text-white shadow-sky-100/50',
  };

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin shrink-0" />;
    }
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ElementType;
    return <IconComponent className="w-4 h-4 shrink-0" />;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        py-3 px-5 rounded-[20px] font-black text-xs uppercase tracking-wider
        inline-flex items-center justify-center gap-2 transition-all duration-200
        shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant] || variantClasses.pink}
        ${className}
      `.trim()}
    >
      {renderIcon()}
      <span>{children || label}</span>
    </button>
  );
};

export default PrimaryButton;
