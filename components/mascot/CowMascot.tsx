'use client';

import React from 'react';

interface CowMascotProps {
  size?: number; // Size in pixels
  mood?: 'happy' | 'delivery' | 'celebrating' | 'wave' | 'thinking' | 'sleeping';
  showMilkPacket?: boolean;
  className?: string;
  animate?: boolean;
}

export const CowMascot: React.FC<CowMascotProps> = ({
  size = 72,
  mood = 'happy',
  showMilkPacket = true,
  className = '',
  animate = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Doodh Dost Friendly Cow Mascot"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-sm transition-transform duration-300 ${
          animate ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        {/* Soft shadow under cow */}
        <ellipse cx="80" cy="148" rx="46" ry="7" fill="#E2EBE5" opacity="0.8" />

        {/* Small Tail */}
        <path
          d="M32 108C22 102 24 88 18 90"
          stroke="#4A524D"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="17" cy="90" r="4.5" fill="#202820" />

        {/* Round White Body */}
        <ellipse cx="80" cy="98" rx="48" ry="42" fill="#FFFFFF" stroke="#E7ECE8" strokeWidth="2.5" />

        {/* Cow Body Black Patches */}
        <path
          d="M52 82C48 72 38 78 34 88C32 94 38 104 46 104C52 104 56 90 52 82Z"
          fill="#2C3530"
        />
        <path
          d="M112 110C118 102 126 106 127 114C128 122 120 126 114 126C108 126 108 116 112 110Z"
          fill="#2C3530"
        />

        {/* Cute Little Feet */}
        <rect x="52" y="132" width="16" height="12" rx="6" fill="#F1F8F3" stroke="#D3DFD7" strokeWidth="2" />
        <rect x="92" y="132" width="16" height="12" rx="6" fill="#F1F8F3" stroke="#D3DFD7" strokeWidth="2" />
        <path d="M52 138H68" stroke="#6B756D" strokeWidth="1.5" />
        <path d="M92 138H108" stroke="#6B756D" strokeWidth="1.5" />

        {/* Head Base */}
        <circle cx="80" cy="62" r="38" fill="#FFFFFF" stroke="#E7ECE8" strokeWidth="2.5" />

        {/* Head Black Patch (over right eye/forehead) */}
        <path
          d="M86 28C98 28 114 42 112 58C110 68 102 68 98 62C94 56 94 40 86 34C82 32 80 28 86 28Z"
          fill="#2C3530"
        />

        {/* Small Cute Horns */}
        <path
          d="M56 32C52 22 58 18 64 25"
          fill="#FFF0D9"
          stroke="#E0CDAF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M104 32C108 22 102 18 96 25"
          fill="#FFF0D9"
          stroke="#E0CDAF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Ears */}
        {/* Left Ear */}
        <g transform={mood === 'wave' ? 'rotate(-8 46 44)' : ''}>
          <ellipse cx="45" cy="46" rx="14" ry="8" transform="rotate(-28 45 46)" fill="#FFFFFF" stroke="#E7ECE8" strokeWidth="2" />
          <ellipse cx="45" cy="46" rx="9" ry="5" transform="rotate(-28 45 46)" fill="#FFCCD8" />
        </g>
        {/* Right Ear */}
        <g transform={mood === 'wave' ? 'rotate(12 115 44)' : ''}>
          <ellipse cx="115" cy="46" rx="14" ry="8" transform="rotate(28 115 46)" fill="#FFFFFF" stroke="#E7ECE8" strokeWidth="2" />
          <ellipse cx="115" cy="46" rx="9" ry="5" transform="rotate(28 115 46)" fill="#FFCCD8" />
        </g>

        {/* Big Expressive Friendly Eyes */}
        {mood === 'celebrating' ? (
          // Star/sparkle eyes
          <g>
            <path d="M64 54L66 50L68 54L72 56L68 58L66 62L64 58L60 56Z" fill="#246B4B" />
            <path d="M96 54L98 50L100 54L104 56L100 58L98 62L96 58L92 56Z" fill="#246B4B" />
          </g>
        ) : mood === 'sleeping' ? (
          // Sleeping arcs
          <g stroke="#202820" strokeWidth="2.5" strokeLinecap="round">
            <path d="M60 56C63 60 69 60 72 56" />
            <path d="M88 56C91 60 97 60 100 56" />
          </g>
        ) : (
          // Standard cute eyes with highlight
          <g>
            {/* Left Eye */}
            <ellipse cx="66" cy="56" rx="4.5" ry="6" fill="#202820" />
            <circle cx="68" cy="53.5" r="2" fill="#FFFFFF" />
            <circle cx="65" cy="58" r="0.8" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="94" cy="56" rx="4.5" ry="6" fill="#202820" />
            <circle cx="96" cy="53.5" r="2" fill="#FFFFFF" />
            <circle cx="93" cy="58" r="0.8" fill="#FFFFFF" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="54" cy="65" rx="5" ry="3.5" fill="#FFAEC0" opacity="0.65" />
        <ellipse cx="106" cy="65" rx="5" ry="3.5" fill="#FFAEC0" opacity="0.65" />

        {/* Big Soft Pink Muzzle / Snout */}
        <ellipse cx="80" cy="74" rx="22" ry="14" fill="#FFCCD8" stroke="#F5A8BA" strokeWidth="1.5" />

        {/* Nostrils */}
        <ellipse cx="73" cy="73" rx="2.2" ry="3.2" fill="#994D60" />
        <ellipse cx="87" cy="73" rx="2.2" ry="3.2" fill="#994D60" />

        {/* Sweet Smile */}
        <path
          d="M74 78C77 82 83 82 86 78"
          stroke="#8A384B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Delivery Cap (if mood is delivery) */}
        {mood === 'delivery' && (
          <g>
            <path d="M60 30C66 22 94 22 100 30L108 34C108 34 80 26 52 34Z" fill="#246B4B" />
            <ellipse cx="80" cy="27" rx="18" ry="7" fill="#246B4B" />
            <path d="M52 34C68 31 92 31 108 34C114 36 102 40 80 40C58 40 46 36 52 34Z" fill="#1C533A" />
            <circle cx="80" cy="24" r="2.5" fill="#B9E6C8" />
          </g>
        )}

        {/* Milk Packet Accessory */}
        {showMilkPacket && (
          <g transform="translate(104, 82)">
            {/* Milk pouch pillow shape */}
            <path
              d="M4 6C4 2 24 2 24 6L26 34C26 38 4 38 4 34Z"
              fill="#F1F8F3"
              stroke="#246B4B"
              strokeWidth="2"
            />
            {/* Top pinch seal */}
            <path d="M2 5L26 5" stroke="#246B4B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M2 35L26 35" stroke="#246B4B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Green brand band */}
            <rect x="4" y="14" width="22" height="12" fill="#246B4B" />
            {/* White droplet or text mark on pouch */}
            <circle cx="15" cy="20" r="3" fill="#FFFFFF" />
            <path d="M15 16L17.5 19H12.5Z" fill="#FFFFFF" />
            <text x="15" y="31" fontSize="4.5" fontWeight="bold" fill="#246B4B" textAnchor="middle" fontFamily="sans-serif">
              DOODH
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
