import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
