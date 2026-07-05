/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the knowledge-base files ship with serverless deployments.
  outputFileTracingIncludes: {
    "/api/**": ["./knowledge/**"],
  },
};

export default nextConfig;
