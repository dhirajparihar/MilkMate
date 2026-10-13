import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  size = 'md',
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    } else if (e.target.value === '') {
      onChange(min);
    }
  };

  const dimensions = {
    sm: { btn: 'w-8 h-8 text-xs', input: 'w-12 h-8 text-sm' },
    md: { btn: 'w-11 h-11 text-sm', input: 'w-16 h-11 text-base' }, // 44px+ touch target
    lg: { btn: 'w-13 h-13 text-base', input: 'w-20 h-13 text-lg font-bold' },
  }[size];

  return (
    <div className="inline-flex items-center rounded-xl bg-[#F1F8F3] p-1 border border-[#B9E6C8]/60 select-none">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${dimensions.btn} flex items-center justify-center rounded-lg bg-white text-[#246B4B] shadow-xs active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-[#E8F5EC] transition-all`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center justify-center px-1">
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          className={`${dimensions.input} bg-transparent text-center font-bold text-[#202820] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        {unit && <span className="text-[10px] text-[#6B756D] -mt-1 font-medium">{unit}</span>}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${dimensions.btn} flex items-center justify-center rounded-lg bg-[#246B4B] text-white shadow-xs active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-[#1C533A] transition-all`}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
