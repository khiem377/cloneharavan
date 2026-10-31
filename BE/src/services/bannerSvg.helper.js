function generateBannerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 650" width="1920" height="650">
  <defs>
    <linearGradient id="redDiagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="40%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <linearGradient id="silverDiagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="25%" stop-color="#dc2626" />
      <stop offset="85%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>

    <filter id="emblemShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000000" flood-opacity="0.55" />
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#7f1d1d" flood-opacity="0.4" />
    </filter>

    <filter id="textDepth" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.75" />
    </filter>

    <filter id="badgeShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="1920" height="650" fill="url(#silverDiagGrad)" />

  <polygon points="0,0 1280,0 720,650 0,650" fill="url(#redDiagGrad)" />

  <polygon points="1260,0 1310,0 750,650 700,650" fill="#ffffff" opacity="0.4" />
  <polygon points="1240,0 1260,0 700,650 680,650" fill="#000000" opacity="0.15" />

  <circle cx="200" cy="120" r="300" fill="#ffffff" opacity="0.08" />
  <circle cx="50" cy="550" r="220" fill="#7f1d1d" opacity="0.3" />
  <circle cx="1750" cy="100" r="250" fill="#e2e8f0" opacity="0.5" />
  <circle cx="1850" cy="550" r="300" fill="#dc2626" opacity="0.06" />

  <g transform="translate(100, 160)">
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="310" height="38" rx="19" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="22" cy="19" r="6" fill="#fef08a" />
      <text x="38" y="25" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="2.5">
        ĐẠI TIỆC BLACK FRIDAY
      </text>
    </g>

    <text x="0" y="105" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="1">
      GIỜ VÀNG SĂN DEAL
    </text>
    <text x="0" y="150" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600" fill="#fecaca" letter-spacing="0.5">
      Bùng nổ công nghệ • Giảm sốc đến 80%
    </text>

    <g transform="translate(0, 185)">
      <rect x="0" y="0" width="380" height="52" rx="10" fill="#000000" fill-opacity="0.3" stroke="#fca5a5" stroke-width="1.5" />
      <text x="24" y="32" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1">
        21/11 - 30/11/2026
      </text>
      <text x="220" y="32" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#fde047">
        • 12:00 HÀNG NGÀY
      </text>
    </g>

    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="180" height="48" rx="24" fill="#ffffff" />
      <text x="90" y="30" text-anchor="middle" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="900" fill="#dc2626" letter-spacing="1">
        SĂN DEAL NGAY
      </text>
    </g>
  </g>

  <g transform="translate(1000, 310)" filter="url(#emblemShadow)">
    <g transform="translate(0, -210)">
      <path d="M -170,25 C -170,2 -60,-12 0,-12 C 60,-12 170,2 170,25 L 155,75 C 60,60 0,60 -155,75 Z" fill="#ffffff" />
      <path d="M -160,28 C -160,8 -55,-6 0,-6 C 55,-6 160,8 160,28 L 148,68 C 55,56 0,56 -148,68 Z" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4" />
      <text x="0" y="38" text-anchor="middle" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="900" fill="#0f172a" letter-spacing="4">
        SPECIAL OFFER
      </text>
    </g>

    <g>
      <path d="M -300,-110 C -300,-150 -260,-165 -160,-165 L 160,-165 C 260,-165 300,-150 300,-110 L 320,60 C 320,130 240,165 140,165 L -140,165 C -240,165 -320,130 -320,60 Z" fill="#5c0a0a" transform="translate(0, 18)" />
      
      <path d="M -300,-110 C -300,-150 -260,-165 -160,-165 L 160,-165 C 260,-165 300,-150 300,-110 L 320,60 C 320,130 240,165 140,165 L -140,165 C -240,165 -320,130 -320,60 Z" fill="#881313" transform="translate(0, 10)" />

      <path d="M -300,-110 C -300,-150 -260,-165 -160,-165 L 160,-165 C 260,-165 300,-150 300,-110 L 320,60 C 320,130 240,165 140,165 L -140,165 C -240,165 -320,130 -320,60 Z" fill="url(#shieldGrad)" stroke="#fca5a5" stroke-width="3" />
    </g>

    <g transform="translate(0, -28)" filter="url(#textDepth)">
      <text x="0" y="14" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="132" font-weight="900" fill="#050505" letter-spacing="2">
        BLACK
      </text>
      <text x="0" y="8" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="132" font-weight="900" fill="#7f1d1d" letter-spacing="2">
        BLACK
      </text>
      <text x="0" y="0" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="132" font-weight="900" fill="#ffffff" letter-spacing="2">
        BLACK
      </text>
    </g>

    <g transform="translate(0, 85)" filter="url(#textDepth)">
      <text x="0" y="14" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="124" font-weight="900" fill="#000000" letter-spacing="3">
        FRIDAY
      </text>
      <text x="0" y="8" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="124" font-weight="900" fill="#1e293b" letter-spacing="3">
        FRIDAY
      </text>
      <text x="0" y="0" text-anchor="middle" font-family="'Arial Black', 'Impact', 'Segoe UI Black', sans-serif" font-size="124" font-weight="900" fill="#0f172a" stroke="#ffffff" stroke-width="2" letter-spacing="3">
        FRIDAY
      </text>
    </g>

    <g transform="translate(0, 160)">
      <path d="M -230,-10 C -120,-30 120,-30 230,-10 L 220,55 C 110,38 -110,38 -220,55 Z" fill="#000000" transform="translate(0, 8)" />
      
      <path d="M -230,-10 C -120,-30 120,-30 230,-10 L 220,55 C 110,38 -110,38 -220,55 Z" fill="#09090b" stroke="#ffffff" stroke-width="2.5" />
      
      <path d="M -220,-4 C -115,-24 115,-24 220,-4 L 212,48 C 105,32 -105,32 -212,48 Z" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="6,4" opacity="0.85" />
      
      <text x="-35" y="32" text-anchor="middle" font-family="'Arial Black', 'Segoe UI Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="1">
        80%
      </text>
      <text x="75" y="32" text-anchor="middle" font-family="'Arial Black', 'Segoe UI Black', sans-serif" font-size="42" font-weight="900" fill="#ef4444" letter-spacing="2">
        SAVE
      </text>
    </g>
  </g>

  <g transform="translate(1560, 210)" filter="url(#badgeShadow)">
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="240" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      <circle cx="28" cy="30" r="14" fill="#ef4444" />
      <path d="M 23,30 L 27,34 L 34,26" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="54" y="27" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#0f172a">
        CHÍNH HÃNG 100%
      </text>
      <text x="54" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b">
        Cam kết hoàn tiền x2
      </text>
    </g>

    <g transform="translate(0, 78)">
      <rect x="0" y="0" width="240" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      <circle cx="28" cy="30" r="14" fill="#0284c7" />
      <path d="M 20,33 L 30,33 L 36,25 L 20,25 Z" fill="none" stroke="#ffffff" stroke-width="2" />
      <circle cx="24" cy="35" r="2" fill="#ffffff" />
      <circle cx="32" cy="35" r="2" fill="#ffffff" />
      <text x="54" y="27" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#0f172a">
        MIỄN PHÍ VẬN CHUYỂN
      </text>
      <text x="54" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b">
        Đơn từ 500k toàn quốc
      </text>
    </g>

    <g transform="translate(0, 156)">
      <rect x="0" y="0" width="240" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      <circle cx="28" cy="30" r="14" fill="#16a34a" />
      <path d="M 24,24 L 32,24 L 32,36 L 24,36 Z" fill="none" stroke="#ffffff" stroke-width="2" />
      <text x="54" y="27" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#0f172a">
        BẢO HÀNH 12 THÁNG
      </text>
      <text x="54" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b">
        1 đổi 1 trong 30 ngày
      </text>
    </g>
  </g>
</svg>`;
}

module.exports = { generateBannerSvg };
