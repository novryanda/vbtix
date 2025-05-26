/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

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
};

export default config;
