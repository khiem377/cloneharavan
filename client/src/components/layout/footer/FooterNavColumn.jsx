import React from 'react';
import Link from 'next/link';

export default function FooterNavColumn({ title, items }) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-3.5">
        {title}
      </h3>
      <ul className="space-y-3">
        {(items || []).map((link, idx) => (
          <li key={idx} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
            <Link
              href={link.customUrl || '#'}
              className="text-xs text-slate-600 hover:text-[#284ea1] transition-colors leading-relaxed"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
