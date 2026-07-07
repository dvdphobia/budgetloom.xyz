/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: ['192.168.43.238', 'localhost'],
}
module.exports = nextConfig
