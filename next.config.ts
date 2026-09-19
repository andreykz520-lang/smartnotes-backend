import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Link", value: '<https://smartnotes-ai.ru/llms.txt>; rel="service-doc", <https://smartnotes-ai.ru/.well-known/api-catalog>; rel="api-catalog"' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/SmartNotes-Setup.exe',
        destination: 'https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/SmartNotes.AI.Setup.1.0.2.exe',
        permanent: false,
      },
      {
        source: '/download/windows',
        destination: 'https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/SmartNotes.AI.Setup.1.0.2.exe',
        permanent: false,
      },
      {
        source: '/SmartNotes-Linux.deb',
        destination: 'https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/smartnotesapp_1.0.2_amd64.deb',
        permanent: false,
      },
      {
        source: '/SmartNotes-Linux.AppImage',
        destination: 'https://github.com/andreykz520-lang/smartnotes-app/releases/download/v1.0.2/SmartNotes.AI-1.0.2.AppImage',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/app',
        destination: '/app/index.html',
      },
      {
        source: '/app/',
        destination: '/app/index.html',
      },
    ];
  },
};

export default nextConfig;
