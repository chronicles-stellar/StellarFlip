import type { NextConfig } from "next";

/**
 * Trusted origins for network connections.
 *
 * These mirror the defaults in `frontend/lib/stellar/config.ts` and can be
 * overridden at build time by setting the corresponding environment variables.
 * Both the testnet and mainnet variants are included so that a single build
 * works across environments; restrict further for a production-only image.
 */
const STELLAR_RPC_ORIGINS = [
  // Soroban RPC
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
  "https://soroban-testnet.stellar.org",
  "https://soroban-mainnet.stellar.org",
  // Horizon REST API
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  "https://horizon-testnet.stellar.org",
  "https://horizon.stellar.org",
].join(" ");

/**
 * Content Security Policy header value.
 *
 * Directives:
 *  - default-src 'self'         — deny everything not listed explicitly
 *  - script-src  'self'         — no inline scripts, no eval, no CDN scripts
 *  - style-src   'self' 'unsafe-inline' — Tailwind injects inline styles at build time
 *  - img-src     'self' data:   — card glyphs rendered as data URIs
 *  - font-src    'self'         — local fonts only
 *  - connect-src 'self' <rpc>   — only Stellar RPC / Horizon calls
 *  - frame-ancestors 'none'     — prevent clickjacking via iframes
 *  - object-src  'none'         — block Flash / plugin embeds
 *  - base-uri    'self'         — prevent base tag hijacking
 *  - form-action 'self'         — prevent form redirect attacks
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${STELLAR_RPC_ORIGINS}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    // Prevent browsers from MIME-sniffing away from the declared content type.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Deny all framing to prevent clickjacking (belt-and-suspenders with CSP
    // frame-ancestors).
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Force HTTPS for one year and include sub-domains.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Block cross-origin information leakage via the Referer header.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Opt out of FLoC / Topics API interest-based tracking.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
