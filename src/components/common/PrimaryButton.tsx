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
  variant?: 'indigo' | 'amber' | 'rose' | 'emerald';
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
  variant = 'indigo',
  fullWidth = false,
}) => {
  const variantClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100/50',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100/50',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100/50',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100/50',
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
        py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-wider
        inline-flex items-center justify-center gap-2 transition-all duration-200
        shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant] || variantClasses.indigo}
        ${className}
      `.trim()}
    >
      {renderIcon()}
      <span>{children || label}</span>
    </button>
  );
};

export default PrimaryButton;
