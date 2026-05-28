import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres", "@trynotifly/db", "drizzle-orm"],
};

export default nextConfig;
