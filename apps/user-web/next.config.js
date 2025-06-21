//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
<<<<<<< HEAD
  // output: 'export', // This is removed to enable server-side features
=======
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {
    svgr: false,
  },
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
<<<<<<< HEAD
  // The "rewrites" feature is re-enabled for Web Service deployments.
=======
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  async rewrites() {
    return [
      {
        source: '/api/:path*',
<<<<<<< HEAD
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
=======
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  },
<<<<<<< HEAD
  // Production optimizations
=======
  // Production optimizations 
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['yourdomain.com'], // Add your image domains here
<<<<<<< HEAD
    unoptimized: false, // Image optimization is supported in Web Services
=======
    unoptimized: process.env.NODE_ENV === 'production',
>>>>>>> 13a80fa78934b14a45c1a7bd9b425b6115337a5c
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
