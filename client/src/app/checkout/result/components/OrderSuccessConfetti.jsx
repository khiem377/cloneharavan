'use client';

import React, { useEffect, useState } from 'react';

const BURSTS = [
  { cx: 180, cy: 150, color: '#e11d48', secondary: '#facc15', delay: '0s', size: 130 },
  { cx: 820, cy: 140, color: '#2563eb', secondary: '#38bdf8', delay: '0.35s', size: 140 },
  { cx: 500, cy: 110, color: '#f59e0b', secondary: '#fbbf24', delay: '0.15s', size: 160 },
  { cx: 320, cy: 230, color: '#10b981', secondary: '#34d399', delay: '0.6s', size: 120 },
  { cx: 680, cy: 220, color: '#8b5cf6', secondary: '#c084fc', delay: '0.8s', size: 130 },
  { cx: 120, cy: 280, color: '#ec4899', secondary: '#f43f5e', delay: '1.0s', size: 110 },
  { cx: 880, cy: 270, color: '#06b6d4', secondary: '#38bdf8', delay: '1.1s', size: 115 },
];

const STREAMERS = [
  { x: 50, color: '#e11d48', delay: 0.1, duration: 3.2, rot: 45 },
  { x: 140, color: '#2563eb', delay: 0.4, duration: 2.8, rot: 120 },
  { x: 230, color: '#f59e0b', delay: 0.2, duration: 3.5, rot: 90 },
  { x: 320, color: '#10b981', delay: 0.6, duration: 3.0, rot: 200 },
  { x: 410, color: '#ec4899', delay: 0.3, duration: 3.4, rot: 60 },
  { x: 500, color: '#8b5cf6', delay: 0.5, duration: 2.9, rot: 150 },
  { x: 590, color: '#f59e0b', delay: 0.2, duration: 3.3, rot: 80 },
  { x: 680, color: '#06b6d4', delay: 0.7, duration: 3.1, rot: 220 },
  { x: 770, color: '#e11d48', delay: 0.4, duration: 3.6, rot: 110 },
  { x: 860, color: '#10b981', delay: 0.8, duration: 2.7, rot: 170 },
  { x: 950, color: '#fbbf24', delay: 0.3, duration: 3.2, rot: 30 },
  { x: 90, color: '#8b5cf6', delay: 1.0, duration: 3.5, rot: 130 },
  { x: 270, color: '#38bdf8', delay: 1.3, duration: 2.8, rot: 75 },
  { x: 450, color: '#e11d48', delay: 1.1, duration: 3.3, rot: 190 },
  { x: 630, color: '#10b981', delay: 1.2, duration: 3.0, rot: 45 },
  { x: 810, color: '#facc15', delay: 0.9, duration: 3.4, rot: 160 },
];

export default function OrderSuccessConfetti() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 7500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes fireworkRay {
          0% { stroke-dashoffset: 45; opacity: 1; transform: scale(0.2); }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; transform: scale(1.35); }
        }
        @keyframes burstRing {
          0% { r: 3; opacity: 1; }
          100% { r: 65; opacity: 0; }
        }
        @keyframes streamerFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          85% { opacity: 0.9; }
          100% { transform: translateY(850px) rotate(720deg); opacity: 0; }
        }
        @keyframes sparkTwinkle {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        .fw-ray { transform-origin: center; animation: fireworkRay 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        .fw-ring { animation: burstRing 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        .streamer { animation: streamerFall linear forwards; }
        .sparkle-core { animation: sparkTwinkle 1.4s ease-in-out infinite; }
      `}</style>

      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMin slice" className="w-full h-full">
        {BURSTS.map((b, bIdx) => (
          <g key={bIdx} transform={`translate(${b.cx}, ${b.cy})`}>
            {/* Vòng nổ lan tỏa */}
            <circle cx="0" cy="0" className="fw-ring" fill="none" stroke={b.color} strokeWidth="2.5" style={{ animationDelay: b.delay }} />
            <circle cx="0" cy="0" className="fw-ring" fill="none" stroke={b.secondary} strokeWidth="1.5" style={{ animationDelay: `${parseFloat(b.delay) + 0.15}s` }} />

            {/* 12 tia pháo hoa phóng tròn các hướng */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, rIdx) => {
              const rad = (angle * Math.PI) / 180;
              const len = b.size * 0.48;
              const x2 = Math.cos(rad) * len;
              const y2 = Math.sin(rad) * len;
              const isEven = rIdx % 2 === 0;
              return (
                <line
                  key={rIdx}
                  x1="0"
                  y1="0"
                  x2={x2}
                  y2={y2}
                  className="fw-ray"
                  stroke={isEven ? b.color : b.secondary}
                  strokeWidth={isEven ? '3.5' : '2'}
                  strokeLinecap="round"
                  strokeDasharray="14 30"
                  style={{ animationDelay: b.delay }}
                />
              );
            })}

            {/* Điểm lóe sáng trung tâm */}
            <circle cx="0" cy="0" r="5" fill="#ffffff" className="sparkle-core" style={{ animationDelay: b.delay }} />
          </g>
        ))}

        {/* Dải giấy Confetti rơi rực rỡ */}
        {STREAMERS.map((st, idx) => (
          <g
            key={idx}
            className="streamer"
            style={{
              transformOrigin: `${st.x}px -10px`,
              animationDuration: `${st.duration}s`,
              animationDelay: `${st.delay}s`,
            }}
          >
            {idx % 3 === 0 ? (
              <rect x={st.x} y="-15" width="10" height="6" rx="1.5" fill={st.color} transform={`rotate(${st.rot}, ${st.x}, -15)`} />
            ) : idx % 3 === 1 ? (
              <circle cx={st.x} cy="-15" r="4" fill={st.color} />
            ) : (
              <polygon points={`${st.x - 5},-15 ${st.x},-20 ${st.x + 5},-15 ${st.x},-10`} fill={st.color} transform={`rotate(${st.rot}, ${st.x}, -15)`} />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
