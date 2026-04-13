const SVG_PLACEHOLDER = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f3f0ec" />
        <stop offset="100%" stop-color="#e0ddd6" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)" />
    <g fill="none" stroke="#0d2340" stroke-opacity="0.16" stroke-width="18">
      <rect x="170" y="120" width="860" height="560" rx="36" />
      <path d="M250 570l185-180 135 125 195-210 185 265" />
      <circle cx="405" cy="305" r="44" fill="#0d2340" fill-opacity="0.1" stroke="none" />
    </g>
  </svg>
`

export const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(SVG_PLACEHOLDER)}`
