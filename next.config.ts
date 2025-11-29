// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: '**.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yourdomain.com',
        pathname: '/**',
      },
    ],

    // Untuk gambar lokal
    domains: ['localhost'],
    // Format yang didukung
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig

// import type { NextConfig } from "next";

// // next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     turbopack: {
//       // Specify the root directory to avoid multiple lockfile detection
//       root: process.cwd(),
//     },
//   },
//   images: {
//     // Ganti domains dengan remotePatterns
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '3000',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '**.amazonaws.com',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '**.cloudfront.net',
//         pathname: '/**',
//       },
//       // Tambahkan domain lain yang Anda gunakan
//       {
//         protocol: 'https',
//         hostname: 'your-production-domain.com',
//         pathname: '/**',
//       },
//     ],
//     // Opsional: tambahkan konfigurasi untuk gambar lokal
//     domains: ['localhost'], // Ini akan tetap work tapi lebih baik pindah ke remotePatterns
//   },
//   // Opsional: jika Anda menggunakan environment variables
//   env: {
//     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
//   },
// }

// module.exports = nextConfig
