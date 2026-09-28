import React from 'react';

export const ShopLogo = ({ className = 'h-8 sm:h-9' }) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <span className="font-black text-2xl sm:text-[28px] tracking-tight text-[#1e2b69] leading-none">
        SH
      </span>
      {/* Power Button O */}
      <span className="relative flex items-center justify-center mx-0.5">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.36 6.64A9 9 0 1 1 5.64 6.64"
            stroke="#e30019"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M12 2V11"
            stroke="#e30019"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-black text-2xl sm:text-[28px] tracking-tight text-[#1e2b69] leading-none">
        P
      </span>
    </div>
  );
};

export default ShopLogo;
