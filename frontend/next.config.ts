import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: process.env.DEV_LAN_IP ? [process.env.DEV_LAN_IP] : [],
};

export default nextConfig;

//notes:
//notice, DEV_LAN_IP does not need NEXT_PUBLIC_ prefix, unlike API_URL.
//next.config.ts runs in Node during the dev server's own startup, not in the browser -
//the NEXT_PUBLIC_ prefix only matters for values that need to reach client-side bundle
//code, which this never does