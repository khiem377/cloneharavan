import React from 'react';

export default function FooterCopyright({ storeSetting }) {
  return (
    <div className="border-t border-slate-200 bg-white py-3.5">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8 text-center text-xs text-slate-500">
        © Bản quyền thuộc về{' '}
        <span className="font-semibold text-slate-800">
          {storeSetting?.name || storeSetting?.businessName || 'Cửa hàng'}
        </span>
        {' '}| Cung cấp bởi{' '}
        <a
          href="https://www.haravan.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-800 hover:text-[#284ea1] transition-colors"
        >
          Haravan
        </a>
      </div>
    </div>
  );
}
