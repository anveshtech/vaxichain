/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3375",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.64",
        port: "3375",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "89.117.149.181",
        port: "3375",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.64",
        port: "8000",
        pathname: "/api/v1/**",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
}

export default nextConfig
