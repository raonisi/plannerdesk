import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AUTHORIZED_ASSET_DELIVERY_MODE:
      process.env.AUTHORIZED_ASSET_DELIVERY_MODE ?? "static",
  },
};

export default nextConfig;
