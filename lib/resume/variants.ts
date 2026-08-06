import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { isResumeContent, type ResumeContent } from "./types";

/**
 * The job-tailored resume cuts. Local only, and never on the deployed site.
 *
 * WHY THESE ARE JSON READ OFF DISK RATHER THAN TYPED MODULES
 *
 * The tailored cuts are gitignored -- they name the companies they were written
 * for, and that is not something to put in a repo's history. Gitignored content
 * and a static `import` are the one combination that cannot coexist: tsconfig
 * includes **\/*.ts, `next build` typechecks every file whether or not it is a
 * route, and a missing module fails the build. On a fresh clone, or on the
 * deploy, the import target simply is not there.
 *
 * Reading the directory at build time has none of that coupling. Nothing
 * imports a variant, so nothing can fail to resolve one; a missing directory is
 * a caught error rather than a broken build. The cost is that TypeScript has
 * checked nothing about the file's contents, which is exactly what
 * isResumeContent() is for -- see the validation note below.
 *
 * Being outside the repo also means these files survive `git clean` only by
 * living somewhere deliberate, so: content/resume-variants/, gitignored as a
 * directory, next to nothing else.
 *
 * ONE CONVENTION THESE FILES USE THAT IS INVISIBLE ON SCREEN
 *
 * A hyphenated compound that lands at the end of a printed line wraps at the
 * hyphen, and any extractor that de-hyphenates on join then reads "Figma-file"
 * as "Figmafile". There is no CSS fix -- see the note in
 * components/Resume/resume.module.scss -- so the fix is a NON-BREAKING HYPHEN,
 * U+2011, in the affected word only.
 *
 * It is used sparingly and only where a break actually occurs, because U+2011
 * is not U+002D and a literal search for the ASCII spelling will not match it.
 * The same word elsewhere in the same file keeps its ordinary hyphen.
 *
 * After editing any variant, re-print and run:
 *   pdftotext -enc UTF-8 -layout <file>.pdf - | grep -- '-$'
 * Every line it prints is a compound a parser will corrupt. Fix those, not all.
 */

const VARIANTS_DIR = path.join(process.cwd(), "content", "resume-variants");

/** "acme-staff.json" -> "acme-staff" */
function slugFromFile(file: string): string {
  return path.basename(file, ".json");
}

/**
 * Every variant slug on disk, or [] when the directory does not exist.
 *
 * The empty case is the normal one in production, not an error state: the
 * directory is gitignored, so a deploy has no variants and there is nothing to
 * generate. That is the intended outcome, which is why a missing directory is
 * swallowed and anything else is not -- a permissions error or a corrupt path
 * is a real failure and should not be silently read as "no variants".
 */
export async function listVariantSlugs(): Promise<string[]> {
  try {
    const files = await readdir(VARIANTS_DIR);
    return files
      .filter((file) => file.endsWith(".json"))
      .map(slugFromFile)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * One variant, validated, or null when there is no such file.
 *
 * The validation is not ceremony. These files are hand-written or pasted out of
 * a document, TypeScript has not seen them, and the failure they would otherwise
 * produce is a resume that renders with three fields quietly missing. A resume
 * that is silently half-empty is worse than one that refuses to build, so a
 * malformed file throws with the path in the message rather than 404ing as if it
 * were absent -- absent and broken are different problems with different fixes.
 */
export async function getVariant(slug: string): Promise<ResumeContent | null> {
  // The slug arrives from a URL segment. Anything that is not a plain slug
  // cannot name a file we wrote, and refusing it here means no traversal
  // sequence ever reaches path.join.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const file = path.join(VARIANTS_DIR, `${slug}.json`);

  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);

  if (!isResumeContent(parsed)) {
    throw new Error(
      `Resume variant "${slug}" does not match ResumeContent. Check ${file} against lib/resume/types.ts.`,
    );
  }

  return parsed;
}
