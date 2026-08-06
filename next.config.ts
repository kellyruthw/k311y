import type { NextConfig } from "next";
import path from "node:path";

/**
 * The dev-only page extension.
 *
 * app/resume/[variant]/page.dev.tsx serves the job-tailored resume cuts. They
 * have to be printable locally and must never be reachable on the deployed
 * site, and the strongest form of "not reachable" is "not built".
 *
 * Next resolves a route file by looking for `page.{ext}` for each configured
 * extension. In production the list below does not contain "dev.tsx", so
 * page.dev.tsx matches nothing: no route, no prerender, no HTML, no entry in the
 * app manifest, nothing to leak. In development the extension is present and the
 * same file resolves normally.
 *
 * The dev-only entries are ADDED to the defaults rather than replacing them,
 * because pageExtensions affects every route file in the app -- page, layout,
 * route, not-found, instrumentation, proxy. Replacing the list with a short one
 * would silently stop resolving anything it left out. If this is ever
 * misconfigured, every route 404s at once on the first build: a loud failure,
 * which is the right shape for a control that must not fail quietly.
 *
 * NODE_ENV is set by the Next CLI before this file is evaluated -- "development"
 * under `next dev`, "production" under `next build`. It is not something a .env
 * file should be setting, and nothing here reads one.
 */
const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];
const DEV_ONLY_EXTENSIONS = ["dev.tsx", "dev.ts"];

const nextConfig: NextConfig = {
  reactCompiler: true,

  pageExtensions:
    process.env.NODE_ENV === "development"
      ? [...DEV_ONLY_EXTENSIONS, ...PAGE_EXTENSIONS]
      : PAGE_EXTENSIONS,

  // There is an unrelated package-lock.json in D:\Websites, and without this
  // Next infers that folder as the workspace root and resolves paths from it.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  sassOptions: {
    // Lets any stylesheet resolve "abstracts" without a ../../../ prefix.
    loadPaths: [path.join(process.cwd(), "styles")],

    // Prepended to every stylesheet webpack/Turbopack treats as an entry, i.e.
    // main.scss and each *.module.scss. Partials pulled in by @use are resolved
    // inside Sass and never reach this, so styles/abstracts cannot import
    // itself and there is no circular @use to avoid.
    //
    // Must be a plain string: Turbopack serializes this config to a worker and
    // a function does not survive the trip -- it is dropped silently, and every
    // mixin then reports as undefined.
    additionalData: '@use "abstracts" as *;',
  },

  images: {
    remotePatterns: [{ protocol: "http", hostname: "k311y-wordpress.local" }],
  },
};

export default nextConfig;
