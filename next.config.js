/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA-Unterstützung vorbereiten
  reactStrictMode: true,

  // Statischer Export für PWA möglich
  // output: 'export', // Aktivieren für statischen Export

  // Headers für PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
