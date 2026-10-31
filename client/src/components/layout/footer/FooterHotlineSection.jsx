import React from 'react';

export default function FooterHotlineSection({ storeSetting }) {
  const hotline = storeSetting?.phone || storeSetting?.hotline || '0949527013';
  const warrantyHotline = storeSetting?.hotline || storeSetting?.phone || '1900 1234';

  return (
    <div className="mt-6 pt-2">
      <h4 className="text-sm font-bold text-slate-900 mb-2.5">
        Tổng đài hỗ trợ
      </h4>
      <ul className="space-y-2 text-xs">
        <li className="flex items-center gap-2 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
          <span>
            Gọi mua hàng:{' '}
            <a
              href={`tel:${hotline}`}
              className="font-bold text-[#284ea1] hover:underline"
            >
              {hotline}
            </a>{' '}
            <span className="text-slate-500">(8h-20h)</span>
          </span>
        </li>
        <li className="flex items-center gap-2 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
          <span>
            Gọi bảo hành:{' '}
            <a
              href={`tel:${warrantyHotline}`}
              className="font-bold text-[#284ea1] hover:underline"
            >
              {warrantyHotline}
            </a>{' '}
            <span className="text-slate-500">(8h-20h)</span>
          </span>
        </li>
      </ul>
    </div>
  );
}
