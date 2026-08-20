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
    ];
  },
  async redirects() {
    return [
      {
        source: '/SmartNotes-Setup.exe',
        destination: 'https://github.com/andreykz520-lang/smartnotes-backend/releases/download/v1.0.0/SmartNotes-AI-Setup-1.0.0.exe',
        permanent: false,
      },
      {
        source: '/download/windows',
        destination: 'https://github.com/andreykz520-lang/smartnotes-backend/releases/download/v1.0.0/SmartNotes-AI-Setup-1.0.0.exe',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
