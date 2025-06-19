/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds and Vercel deployments.
 */
if (!process.env.SKIP_ENV_VALIDATION) {
  await import("./src/env.js");
}

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: [
      "cdn-icons-png.flaticon.com",
      "res.cloudinary.com",
      "placehold.co",
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true, // Skips eslint checking during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skips type checking during builds
  },
  // Optimize for Vercel deployment
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Disable source maps in development to prevent 404 errors for source files
  productionBrowserSourceMaps: false,
};

export default config;
