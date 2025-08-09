import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [], // Add external image domains if needed
  },
  
  // Security headers are in vercel.json
  // But we can add more Next.js specific options here
  poweredByHeader: false,
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "TTFB"],
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === "true") {
      const BundleAnalyzerPlugin = require("@next/bundle-analyzer")({
        enabled: true,
      });
      config.plugins.push(
        new BundleAnalyzerPlugin.BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: true,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
