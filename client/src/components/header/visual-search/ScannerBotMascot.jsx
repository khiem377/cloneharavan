import React, { useId } from 'react';

/**
 * ScannerBotMascot — Hoạt cảnh: Máy vi tính trên bàn, Mascot thò tay vào màn hình lấy ảnh quăng vào vùng upload
 * - Bối cảnh: Máy vi tính (màn hình iMac/Studio Display + bàn phím + chuột) nằm trên mặt bàn làm việc.
 * - Mascot: Chú Robot AI công nghệ cao đứng cạnh máy tính trên mặt bàn.
 * - Cốt truyện hoạt họa (Animation Timeline 4.2s):
 *   1. (0s - 1.2s): Tay robot từ từ vươn dài, thò xuyên qua mặt kính màn hình máy tính.
 *   2. (1.2s - 1.8s): Ngón tay kẹp lấy 1 bức ảnh sản phẩm bên trong màn hình (ảnh phát sáng).
 *   3. (1.8s - 2.5s): Tay từ từ rút bức ảnh ra khỏi màn hình, kéo người lùi về sau lấy đà ném.
 *   4. (2.5s - 3.2s): Vung tay cực mạnh, quăng bức ảnh bay vút lên cao theo đường cong parabol!
 *   5. (3.2s - 3.8s): Bức ảnh cắm chuẩn xác vào Vùng Upload, làm khay upload rung nảy và phát sóng xung kích.
 *   6. (3.8s - 4.2s): Mascot nhún nhảy cười tít mắt (^ ^), thu tay về vị trí nghỉ, lặp lại chu kỳ.
 * - Tuân thủ: IMPECCABLE_DESIGN_STANDARD (1px border, bo góc 6px, flat colors, không emoji rẻ tiền).
 */
export default function ScannerBotMascot({ state = 'idle', size = 300, className = '' }) {
  const uid = useId().replace(/:/g, '_');
  const isDrag = state === 'drag';
  const isScanning = state === 'scanning';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none max-w-full ${className}`}>
      <svg
        viewBox="0 0 380 180"
        width={size}
        height={(size * 180) / 380}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Gradients cho thân robot */}
          <linearGradient id={`botBody_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Mặt nạ Visor đen bóng công nghệ cao */}
          <linearGradient id={`visor_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Màn hình máy tính */}
          <linearGradient id={`screenBg_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Neon Glow Filter */}
          <filter id={`neonGlow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft Shadow Filter */}
          <filter id={`softShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
        </defs>

        <style>{`
          /* =========================================================
             1. ANIMATION CÁNH TAY ROBOT
             - 0% - 25%: Từ từ thò tay vào sâu bên trong màn hình máy tính
             - 25% - 40%: Kẹp giữ bức ảnh trong màn hình
             - 40% - 55%: Rút ảnh ra khỏi màn hình, kéo lùi về sau lấy đà
             - 55% - 66%: Vung tay ném ảnh cực mạnh về phía vùng upload
             - 66% - 85%: Hạ tay xuống, chỉ hướng theo ảnh
             - 85% - 100%: Thu tay về vị trí chuẩn bị lặp lại
             ========================================================= */
          @keyframes armReachAndToss {
            0% {
              /* Đứng thư thái cạnh máy tính */
              transform: rotate(-10deg) translate(0, 0);
            }
            15% {
              /* Bắt đầu đưa tay về phía viền màn hình */
              transform: rotate(-32deg) translate(-8px, -2px);
            }
            26%, 36% {
              /* TỪ TỪ THÒ TAY VÀO SÂU TRONG MÀN HÌNH ĐỂ LẤY ẢNH */
              transform: rotate(-50deg) translate(-22px, -6px);
            }
            46% {
              /* RÚT ẢNH RA KHỎI MÀN HÌNH */
              transform: rotate(-15deg) translate(-4px, 0);
            }
            54% {
              /* KÉO TAY RA SAU THÂN MÌNH LẤY ĐÀ NÉM */
              transform: rotate(32deg) translate(8px, -4px);
            }
            62% {
              /* VUNG MẠNH TAY VỀ PHÍA TRƯỚC ĐỂ QUĂNG ẢNH */
              transform: rotate(-38deg) translate(14px, -10px);
            }
            72%, 84% {
              /* Buông lỏng tay, chỉ theo hướng ảnh bay */
              transform: rotate(-8deg) translate(4px, 2px);
            }
            100% {
              /* Về lại tư thế ban đầu */
              transform: rotate(-10deg) translate(0, 0);
            }
          }

          /* =========================================================
             2. ANIMATION QUỸ ĐẠO BỨC ẢNH
             - 0% - 26%: Nằm trong màn hình máy tính (sáng dần)
             - 26% - 36%: Được tay robot nắm chặt
             - 36% - 46%: Được kéo bay ra khỏi màn hình
             - 46% - 54%: Kéo về sau cùng tay robot lấy đà
             - 54% - 72%: BAY THEO ĐƯỜNG CONG PARABOL LÊN CAO VÀ RƠI XUỐNG
             - 72% - 80%: RƠI VÀ CẮM CHUẨN XÁC VÀO VÙNG UPLOAD, NẢY NHẸ
             - 80% - 90%: Lọt hẳn vào khay upload, mờ dần
             - 90% - 100%: Ẩn để tái xuất hiện trong màn hình máy tính
             ========================================================= */
          @keyframes photoTossParabola {
            0%, 20% {
              /* Nằm ngay ngắn bên trong màn hình máy tính */
              transform: translate(78px, 86px) scale(0.65) rotate(-6deg);
              opacity: 0.75;
            }
            26%, 36% {
              /* Robot chạm tay vào, ảnh phát sáng rực rỡ */
              transform: translate(78px, 86px) scale(0.75) rotate(-3deg);
              opacity: 1;
            }
            46% {
              /* Bị kéo ra khỏi màn hình máy tính */
              transform: translate(145px, 82px) scale(0.85) rotate(4deg);
              opacity: 1;
            }
            54% {
              /* Kéo lùi ra sau lấy đà ném */
              transform: translate(175px, 72px) scale(0.9) rotate(20deg);
              opacity: 1;
            }
            62% {
              /* Bay vút lên đỉnh parabol trên không */
              transform: translate(242px, 34px) scale(1) rotate(32deg);
              opacity: 1;
            }
            72% {
              /* Lao cắm chuẩn xác vào miệng vùng upload bên phải */
              transform: translate(316px, 114px) scale(0.9) rotate(-8deg);
              opacity: 1;
            }
            78% {
              /* Nảy nhẹ 1 nhịp khi va chạm khay upload */
              transform: translate(316px, 108px) scale(0.85) rotate(-2deg);
              opacity: 0.9;
            }
            85% {
              /* Lọt thỏm vào sâu trong đáy vùng upload */
              transform: translate(316px, 126px) scale(0.6) rotate(0deg);
              opacity: 0.4;
            }
            92%, 100% {
              /* Ẩn hoàn toàn */
              transform: translate(316px, 130px) scale(0.3);
              opacity: 0;
            }
          }

          /* =========================================================
             3. ANIMATION VÙNG UPLOAD RUNG NẢY & PHÁT SÓNG XUNG KÍCH KHI ẢNH RƠI VÀO
             - Rung nảy phản lực ở 72% - 82% khi ảnh cắm vào
             ========================================================= */
          @keyframes uploadZoneImpact {
            0%, 70% {
              transform: translateY(0) scale(1);
            }
            73% {
              /* RUNG NẢY LÊN KHI ẢNH CHẠM ĐÍCH */
              transform: translateY(-4px) scale(1.05);
            }
            77% {
              /* Nhún xuống hấp thụ lực */
              transform: translateY(2px) scale(0.98);
            }
            82%, 100% {
              transform: translateY(0) scale(1);
            }
          }

          @keyframes impactRippleWaves {
            0%, 71% {
              r: 0px;
              opacity: 0;
            }
            73% {
              r: 12px;
              opacity: 0.8;
            }
            85% {
              r: 34px;
              opacity: 0;
            }
            100% {
              r: 34px;
              opacity: 0;
            }
          }

          /* =========================================================
             4. ANIMATION GỢN SÓNG KHI TAY THÒ VÀO MÀN HÌNH MÁY TÍNH (PORTAL RIPPLE)
             ========================================================= */
          @keyframes screenPortalGlow {
            0%, 15% {
              opacity: 0;
              stroke-dashoffset: 0;
            }
            24%, 38% {
              /* Sáng bừng lên khi tay robot thò vào bên trong */
              opacity: 0.9;
              stroke-dashoffset: 20;
            }
            48%, 100% {
              opacity: 0;
            }
          }

          /* =========================================================
             5. ANIMATION MẮT LED CẢM XÚC ROBOT (DÕI THEO HÀNH ĐỘNG)
             ========================================================= */
          @keyframes robotLookCycle {
            0%, 12% {
              /* Nhìn thẳng */
              transform: translate(0, 0);
            }
            22%, 38% {
              /* LIẾC NHÌN CHĂM CHÚ SANG TRÁI VÀO MÀN HÌNH */
              transform: translate(-3.5px, 0.5px);
            }
            46%, 54% {
              /* Nhìn theo bàn tay kéo ảnh về */
              transform: translate(-1px, 1px);
            }
            62%, 74% {
              /* LIẾC MẮT HƯỚNG THEO ĐƯỜNG BAY CỦA ẢNH SANG PHẢI */
              transform: translate(3.5px, -1px);
            }
            78%, 90% {
              /* Nhìn xuống khay upload cười tít mắt */
              transform: translate(2px, 1.5px);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          /* =========================================================
             6. NHÚN NHẢY THÂN ROBOT
             ========================================================= */
          @keyframes robotBodySway {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            28% { transform: translateY(1px) rotate(-1.5deg); }
            54% { transform: translateY(-2px) rotate(2deg); }
            62% { transform: translateY(2px) rotate(-1deg); }
            78% { transform: translateY(-3px) rotate(0.5deg); }
            86% { transform: translateY(0) rotate(0deg); }
          }

          .anim-arm-reach-toss {
            transform-origin: 172px 94px;
            animation: armReachAndToss 4.2s cubic-bezier(0.34, 1.2, 0.64, 1) infinite;
          }
          .anim-photo-parabola {
            animation: photoTossParabola 4.2s cubic-bezier(0.25, 0.9, 0.45, 1) infinite;
          }
          .anim-upload-impact {
            transform-origin: 316px 125px;
            animation: uploadZoneImpact 4.2s ease-in-out infinite;
          }
          .anim-ripple-impact {
            animation: impactRippleWaves 4.2s ease-out infinite;
          }
          .anim-portal-glow {
            animation: screenPortalGlow 4.2s ease-in-out infinite;
          }
          .anim-eyes-look {
            animation: robotLookCycle 4.2s ease-in-out infinite;
          }
          .anim-body-sway {
            animation: robotBodySway 4.2s ease-in-out infinite;
          }
        `}</style>

        {/* =========================================================
            PHẦN 1: MẶT BÀN LÀM VIỆC (DESK SURFACE)
            ========================================================= */}
        <g>
          {/* Bóng đổ gầm bàn */}
          <ellipse cx="190" cy="158" rx="165" ry="6.5" fill="#f1f5f9" />
          {/* Mặt bàn phẳng 1px sắc nét */}
          <line x1="20" y1="152" x2="360" y2="152" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          {/* Mép bàn dày hiện đại */}
          <line x1="24" y1="155" x2="356" y2="155" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />
          {/* Chân bàn kim loại vững chắc */}
          <line x1="36" y1="155" x2="36" y2="174" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="344" y1="155" x2="344" y2="174" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* =========================================================
            PHẦN 2: CHIẾC MÁY VI TÍNH NẰM TRÊN BÀN (BÊN TRÁI)
            ========================================================= */}
        <g id="desktop-computer">
          {/* Chân đế iMac / màn hình vi tính */}
          <rect x="74" y="124" width="8" height="28" rx="2" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <ellipse cx="78" cy="151" rx="22" ry="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />

          {/* Vỏ màn hình vi tính sắc nét (Desktop Monitor) */}
          <rect
            x="30"
            y="44"
            width="96"
            height="82"
            rx="6"
            fill={`url(#screenBg_${uid})`}
            stroke="#334155"
            strokeWidth="1.8"
            filter={`url(#softShadow_${uid})`}
          />

          {/* Mặt kính màn hình hiển thị */}
          <rect
            x="34"
            y="48"
            width="88"
            height="74"
            rx="4"
            fill="#1e293b"
          />

          {/* Thanh tiêu đề cửa sổ ứng dụng trên màn hình */}
          <rect x="34" y="48" width="88" height="12" rx="4" fill="#0f172a" />
          {/* 3 nút chấm tròn macOS */}
          <circle cx="42" cy="54" r="2.2" fill="#ef4444" />
          <circle cx="48" cy="54" r="2.2" fill="#f59e0b" />
          <circle cx="54" cy="54" r="2.2" fill="#10b981" />
          <text x="64" y="56" fill="#64748b" fontSize="5.5" fontFamily="monospace" fontWeight="500">
            photo_library.ai
          </text>

          {/* Khung chứa ảnh gốc trong màn hình (nơi ảnh xuất phát) */}
          <rect
            x="60"
            y="68"
            width="36"
            height="44"
            rx="3"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2.5 2"
            opacity="0.4"
          />

          {/* Hiệu ứng hào quang cổng không gian khi tay robot thò vào màn hình */}
          <rect
            x="34"
            y="48"
            width="88"
            height="74"
            rx="4"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="anim-portal-glow"
          />

          {/* Bàn phím mỏng trên mặt bàn */}
          <rect x="52" y="147" width="52" height="4" rx="1.2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Chuột máy tính bên cạnh */}
          <ellipse cx="116" cy="149" rx="5" ry="3.2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        </g>

        {/* =========================================================
            PHẦN 3: VÙNG UPLOAD / KHAY UPLOAD TRÊN BÀN (BÊN PHẢI)
            - Rung nảy và phát sóng xung kích khi ảnh rơi vào!
            ========================================================= */}
        <g id="upload-zone" className="anim-upload-impact">
          {/* Vòng sóng xung kích tỏa ra khi ảnh rơi trúng */}
          <circle cx="316" cy="126" r="0" fill="none" stroke="#38bdf8" strokeWidth="1.8" className="anim-ripple-impact" />

          {/* Thùng / Khay Upload nổi trên bàn */}
          <rect
            x="280"
            y="106"
            width="72"
            height="44"
            rx="6"
            fill={isDrag ? '#fef2f2' : '#ffffff'}
            stroke={isDrag ? '#ef4444' : '#0284c7'}
            strokeWidth="1.6"
            strokeDasharray={isDrag ? 'none' : '4 3'}
            filter={`url(#softShadow_${uid})`}
          />

          {/* Đáy hứng bên trong khay */}
          <rect
            x="285"
            y="126"
            width="62"
            height="20"
            rx="4"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Mũi tên Upload hướng lên */}
          <g stroke={isDrag ? '#ef4444' : '#0284c7'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="316" y1="122" x2="316" y2="112" />
            <polyline points="311,117 316,112 321,117" />
          </g>

          {/* Chữ VÙNG UPLOAD sắc nét */}
          <text
            x="316"
            y="139"
            textAnchor="middle"
            fill={isDrag ? '#dc2626' : '#0369a1'}
            fontSize="7"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.5"
          >
            VÙNG UPLOAD
          </text>
        </g>

        {/* =========================================================
            PHẦN 4: CON MASCOT ROBOT AI ĐỨNG TRÊN BÀN (Ở GIỮA)
            ========================================================= */}
        <g id="mascot-robot" className="anim-body-sway">
          {/* Hai bàn chân đứng vững trên mặt bàn */}
          <ellipse cx="178" cy="151" rx="8" ry="3.2" fill="#64748b" />
          <ellipse cx="202" cy="151" rx="8" ry="3.2" fill="#64748b" />
          {/* Khớp chân kim loại */}
          <rect x="176" y="140" width="4.5" height="11" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <rect x="200" y="140" width="4.5" height="11" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

          {/* Thân Robot (Capsule công nghệ cao) */}
          <path
            d="M170 88C170 78 180 74 190 74C200 74 210 78 210 88V130C210 138 200 142 190 142C180 142 170 138 170 130V88Z"
            fill={`url(#botBody_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Đèn báo trạng thái ngực robot */}
          <circle cx="190" cy="106" r="3.8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="190" cy="106" r="2" fill={isDrag ? '#ef4444' : '#38bdf8'} filter={`url(#neonGlow_${uid})`} />

          {/* Khớp cổ kim loại */}
          <ellipse cx="190" cy="74" rx="11" ry="3" fill="#334155" />

          {/* Đầu Robot bo góc mềm mại */}
          <rect
            x="164"
            y="32"
            width="52"
            height="42"
            rx="16"
            fill={`url(#botBody_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
            filter={`url(#softShadow_${uid})`}
          />

          {/* Ăng-ten phát sóng công nghệ */}
          <rect x="188.5" y="18" width="3" height="14" rx="1.5" fill="#64748b" />
          <circle
            cx="190"
            cy="16"
            r="4.5"
            fill={isDrag ? '#ef4444' : isScanning ? '#10b981' : '#38bdf8'}
            stroke="#ffffff"
            strokeWidth="1.2"
            filter={`url(#neonGlow_${uid})`}
          />

          {/* Tai nghe 2 bên */}
          <rect x="159" y="42" width="6" height="22" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <circle cx="162" cy="53" r="1.8" fill={isDrag ? '#ef4444' : '#38bdf8'} />
          <rect x="215" y="42" width="6" height="22" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <circle cx="218" cy="53" r="1.8" fill={isDrag ? '#ef4444' : '#38bdf8'} />

          {/* Mặt kính Visor đen bóng */}
          <rect
            x="168"
            y="38"
            width="44"
            height="28"
            rx="11"
            fill={`url(#visor_${uid})`}
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Vệt bóng phản chiếu trên kính */}
          <path d="M172 42C178 40 186 39 198 39C205 39 209 40 211 42" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.35" />

          {/* ĐÔI MẮT LED BIỂU CẢM (DÕI THEO TAY VÀ ẢNH) */}
          {isDrag ? (
            /* Khi người dùng kéo file vào: Mắt sao háo hức (* *) */
            <g fill="#ef4444" filter={`url(#neonGlow_${uid})`}>
              <g transform="translate(180, 52)">
                <path d="M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z" />
              </g>
              <g transform="translate(200, 52)">
                <path d="M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z" />
              </g>
              <path d="M186 60C188 62.5 192 62.5 194 60" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Trạng thái bình thường: Mắt chuyển động theo quỹ đạo tay và ảnh */
            <g className="anim-eyes-look" filter={`url(#neonGlow_${uid})`}>
              {/* Mắt trái */}
              <circle cx="180" cy="51" r="3.2" fill="#38bdf8" />
              <circle cx="179" cy="50" r="1.2" fill="#ffffff" />
              {/* Mắt phải */}
              <circle cx="200" cy="51" r="3.2" fill="#38bdf8" />
              <circle cx="199" cy="50" r="1.2" fill="#ffffff" />
              {/* Miệng cười hiền hòa */}
              <path d="M187 58C188.5 60 191.5 60 193 58" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          )}

          {/* Tay trái Robot: Thả lỏng tự nhiên giữ thăng bằng */}
          <g>
            <path d="M208 94C216 98 222 106 224 116" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
            <circle cx="224" cy="118" r="6" fill={`url(#botBody_${uid})`} stroke="#94a3b8" strokeWidth="1.2" />
          </g>

          {/* =========================================================
              CÁNH TAY PHẢI CƠ KHÍ CỦA ROBOT:
              THÒ VÀO MÀN HÌNH -> LẤY ẢNH -> NÉM SANG VÙNG UPLOAD!
              ========================================================= */}
          <g className="anim-arm-reach-toss">
            {/* Cánh tay cơ khí */}
            <path
              d="M172 94C158 92 142 86 128 80"
              stroke="#cbd5e1"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Khớp cổ tay kim loại */}
            <circle cx="125" cy="79" r="6.5" fill={`url(#botBody_${uid})`} stroke="#94a3b8" strokeWidth="1.4" />
            {/* Các ngón tay kẹp ảnh */}
            <rect x="115" y="75" width="10" height="3.2" rx="1.6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <rect x="115" y="81" width="10" height="3.2" rx="1.6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          </g>
        </g>

        {/* =========================================================
            PHẦN 5: BỨC ẢNH SẢN PHẨM BAY THEO ĐƯỜNG PARABOL
            - Xuất phát trong màn hình máy tính -> Robot kẹp lấy -> Bay vòng cung -> Rơi cắm vào Vùng Upload
            ========================================================= */}
        <g className="anim-photo-parabola">
          {/* Khung viền ảnh Polaroid trắng tinh tế */}
          <rect
            x="-18"
            y="-22"
            width="36"
            height="44"
            rx="3.5"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            filter={`url(#softShadow_${uid})`}
          />

          {/* Ô hình ảnh sản phẩm bên trong */}
          <rect
            x="-15"
            y="-19"
            width="30"
            height="26"
            rx="2.5"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="0.8"
          />

          {/* Họa tiết minh họa sản phẩm: Máy ảnh kỹ thuật số rực rỡ */}
          <g transform="translate(0, -6)">
            {/* Thân máy ảnh */}
            <rect x="-10" y="-6" width="20" height="13" rx="2" fill="#0284c7" />
            {/* Ống kính máy ảnh */}
            <circle cx="0" cy="0.5" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="0" cy="0.5" r="2.2" fill="#38bdf8" />
            {/* Đèn flash máy ảnh */}
            <circle cx="6" cy="-3.5" r="1.2" fill="#f59e0b" />
          </g>

          {/* Vạch mô tả tên sản phẩm dưới đáy ảnh */}
          <rect x="-14" y="11" width="18" height="2.2" rx="1.1" fill="#64748b" />
          <rect x="-14" y="15" width="11" height="1.8" rx="0.9" fill="#94a3b8" />
        </g>
      </svg>
    </div>
  );
}
