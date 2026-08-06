import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Resume from "@/components/Resume/Resume";
import { getVariant, listVariantSlugs } from "@/lib/resume/variants";
import "../print.scss";

/**
 * /resume/<variant> -- the job-tailored cuts. Local only.
 *
 * Three locks, and they are independent on purpose:
 *
 *   1. next.config.ts drops ".dev.tsx" from pageExtensions in production, so
 *      this file is not a route there at all. That is the real one.
 *   2. dynamicParams = false plus a generateStaticParams that reads a gitignored
 *      directory means that even IF the file were routed, only slugs that
 *      function listed would be served -- and on a deploy the directory does not
 *      exist, so it lists none.
 *   3. notFound() at the top of the component, which is the lock that survives
 *      someone renaming the file to page.tsx to "fix" a local problem.
 *
 * Rename-the-file is not hypothetical. It is the single most likely way this
 * ships by accident, and lock 1 does not survive it.
 */

/**
 * The params type is written out rather than using Next 16's generated
 * `PageProps<'/resume/[variant]'>` helper, and that is not a style preference.
 *
 * Those helpers are generated from the routes that EXIST, during `next dev`,
 * `next build` or `next typegen`. In a production build this file is not a
 * route, so `/resume/[variant]` is never generated -- but `next build` still
 * TYPECHECKS the file, because tsconfig.json includes **\/*.tsx. The helper
 * would resolve locally and fail only on the deploy, which is the worst possible
 * place to find out. app/(site)/case-studies/[slug]/page.tsx writes its params
 * out by hand too.
 */
type VariantParams = { params: Promise<{ variant: string }> };

/** Only slugs generateStaticParams listed are served. Everything else 404s. */
export const dynamicParams = false;

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];

  const slugs = await listVariantSlugs();
  return slugs.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: VariantParams): Promise<Metadata> {
  const { variant } = await params;

  // noindex/nofollow is belt to lock 1's braces. A page that does not exist
  // cannot be indexed, but the directive costs nothing and is the thing that is
  // still true if this ever ships on a preview deploy.
  return {
    title: `Resume: ${variant} / Kelly Warpechowski`,
    robots: { index: false, follow: false },
  };
}

export default async function ResumeVariantPage({ params }: VariantParams) {
  if (process.env.NODE_ENV === "production") notFound();

  const { variant } = await params;
  const content = await getVariant(variant);
  if (!content) notFound();

  return <Resume content={content} />;
}
