/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/codewar/:path*',
        destination: '/algolympia/:path*',
        permanent: true,
      },
      {
        source: '/api/codewar/:path*',
        destination: '/api/algolympia/:path*',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
