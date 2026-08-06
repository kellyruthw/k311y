import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,

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
