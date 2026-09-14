import React from 'react';

interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: React.CSSProperties;
  children: React.ReactNode;
}

export const ScrollView: React.FC<ScrollViewProps> = ({ 
  children, 
  showsVerticalScrollIndicator = true,
  contentContainerStyle,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`overflow-y-auto flex-1 ${!showsVerticalScrollIndicator ? '[&::-webkit-scrollbar]:hidden no-scrollbar' : ''} ${className}`}
      {...props}
    >
      <div style={{ minHeight: '100%', ...contentContainerStyle }}>
        {children}
      </div>
    </div>
  );
};
