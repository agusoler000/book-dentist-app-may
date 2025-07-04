import path from 'path';
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Otras opciones de Next.js aquí si las tienes
};

export default withPWA({
  ...nextConfig,
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: !isProd,
  },
});