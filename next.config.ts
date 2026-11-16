import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // pdf-parse -> pdfjs-dist spawns/imports its worker at runtime. Bundling it
  // breaks the fake-worker loader (Turbopack replaces the dynamic worker
  // import with a throwing stub), so keep it external on the Node runtime.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
};

export default nextConfig;
