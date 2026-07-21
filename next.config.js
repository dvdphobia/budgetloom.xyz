/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: static export (`output: 'export'`) was removed so this app can use
  // a server-side API route (/api/subscribe) to call MailerLite without
  // exposing the API key in the browser. Vercel hosts this natively.
  trailingSlash: false,
  allowedDevOrigins: ["192.168.43.238", "localhost"],
};
module.exports = nextConfig;
