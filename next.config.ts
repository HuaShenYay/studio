import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent fs module from being bundled on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // canvas and sharp are server-side dependencies, so we externalize them
    config.externals = [...config.externals, 'canvas', 'sharp'];
    return config;
  },
};

export default nextConfig;
