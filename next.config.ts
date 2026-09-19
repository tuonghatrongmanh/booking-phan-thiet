import type { NextConfig } from "next";

// Security headers - Lop 2 (ung dung) trong mo hinh phong thu 3 lop da trao doi voi
// user. CSP duoc noi long o vai cho (unsafe-inline/unsafe-eval cho script, unsafe-inline
// cho style) vi Next.js tu chen script hydration inline va Tailwind dung nhieu inline
// style={{...}} - that chat hon se can nonce-based CSP (thay doi kien truc lon hon,
// de lai cho lan sau neu can). Van chan duoc XSS tu nguon ngoai (default-src 'self'),
// clickjacking (X-Frame-Options), MIME-sniffing, va ep HTTPS (HSTS) khi len production.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
      "connect-src 'self' ws: wss: https:",
      "frame-src 'self' https://accounts.google.com https://www.youtube.com https://www.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-image-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "*.staticflickr.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // File xác minh IndexNow phải nằm ở gốc domain (/<key>.txt) - key là hash hex 32 ký tự,
  // trả về bởi route handler vì key sinh từ NEXTAUTH_SECRET (xem src/lib/indexnow.ts).
  async rewrites() {
    return [{ source: "/:key([a-f0-9]{32}).txt", destination: "/api/indexnow-key/:key" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
