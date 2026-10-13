'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full ${maxWidthClasses} bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-[#E7ECE8] max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250`}
      >
        {/* Mobile drag handle bar */}
        <div className="sm:hidden w-12 h-1.5 bg-[#E7ECE8] rounded-full mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7ECE8] bg-white sticky top-0 z-10">
            <div>
              {title && <h3 className="text-base sm:text-lg font-bold text-[#202820] leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-[#6B756D] mt-0.5">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B756D] hover:bg-[#F1F8F3] hover:text-[#202820] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
