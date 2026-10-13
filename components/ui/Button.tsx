import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'cream';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246B4B] focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 h-9 gap-1.5 min-w-[36px]',
    md: 'text-sm px-4 py-2.5 h-11 gap-2 min-w-[44px]', // Android touch target >= 44px
    lg: 'text-base px-5 py-3 h-12 gap-2.5 min-w-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[#246B4B] text-white hover:bg-[#1C533A] active:bg-[#15402C] shadow-sm shadow-[#246B4B]/20',
    secondary:
      'bg-[#F1F8F3] text-[#246B4B] hover:bg-[#E3F2E8] active:bg-[#D5EBDC] border border-[#B9E6C8]/60',
    outline:
      'bg-white text-[#202820] hover:bg-[#F8FAF8] border border-[#E7ECE8] active:bg-[#F1F8F3]',
    danger:
      'bg-[#C62828] text-white hover:bg-[#B71C1C] active:bg-[#991515] shadow-sm',
    ghost:
      'text-[#6B756D] hover:text-[#202820] hover:bg-[#F1F8F3] active:bg-[#E7ECE8]',
    cream:
      'bg-[#FFF0D9] text-[#7A5012] hover:bg-[#FFE6C2] active:bg-[#FEDCAE] border border-[#FFE1B3]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
