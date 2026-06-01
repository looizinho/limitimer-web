import type { NextConfig } from "next";

const isTauriTarget = process.env.BUILD_TARGET === 'tauri';
const isProd = process.env.NODE_ENV === 'production';
const tauriDevHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  // Dual-target output configuration
  // Tauri: 'standalone' = self-contained Node.js server (no Vercel required)
  // Web: undefined = default SSR for Vercel
  output: isTauriTarget ? 'standalone' : undefined,

  // Image optimization (disabled for Tauri, enabled for web)
  images: isTauriTarget ? { unoptimized: true } : undefined,

  // Asset prefix for Tauri dev mode (for WebView routing)
  assetPrefix: isTauriTarget && !isProd
    ? `http://${tauriDevHost}:3000`
    : undefined,

  // Web build config (unchanged from current)
  allowedDevOrigins: ['mac', 'mac.local', '10.147.19.114', '192.168.0.100', 'http://localhost:3000'],
};

export default nextConfig;
