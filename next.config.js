/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false, maybe is causing two calls to api? tested and didnt seem like it was though
  experimental: {
    instrumentationHook: true
  }
};

module.exports = nextConfig;