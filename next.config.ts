import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  agentRules: false,
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    // These routes are static, auth-gated app shells (no server data baked in — the
    // client hydrates and reads everything from Dexie/Supabase after mount), so
    // precaching them is what makes a cold hard-navigation to e.g. /personal/goals
    // work while offline, not just a client-side route change within an already
    // -loaded session.
    // ponytail: hand-listed; a newly added static route needs adding here too —
    // revisit with a build-time glob over the app-shell routes if that gets missed often.
    additionalManifestEntries: (() => {
      const revision = Date.now().toString();
      return ["/login", "/personal/today", "/personal/goals"].map((url) => ({ url, revision }));
    })(),
  },
})(nextConfig);
