/**
 * The resume's content shape.
 *
 * This is the one piece of content on the site that does NOT come from
 * WordPress, and that is a decision rather than an omission. A resume is a
 * document with a fixed structure that gets tailored per application: several
 * job-specific cuts exist, and the sane unit of tailoring is a file you can
 * diff, not a set of ACF rows an editor has to duplicate and keep in step.
 * Nothing about a resume benefits from being editable by someone else, and
 * making it CMS content would also make it depend on WordPress being up at
 * build time -- for the one page most likely to be opened from a job
 * application.
 *
 * The contract this shape exists to hold: a variant is ONE new file. Nothing in
 * components/Resume knows how many variants there are or what is in them, and
 * nothing in a content file knows how it is laid out.
 *
 * The section labels -- "Experience", "Skills", "Education" -- are deliberately
 * NOT fields. They are structure, not copy, and a variant must not be able to
 * rename them. They live in the renderer.
 */

/**
 * One item on the contact line.
 *
 * `href` is optional and the renderer branches on it, because the handoff makes
 * real anchors a hard requirement -- mailto for the email, tel for the phone,
 * https for k311y.com -- and a value that genuinely is not a link should not be
 * given a fake one.
 */
export interface ResumeContactItem {
  /** What is printed, e.g. "kellyruthw@gmail.com". */
  label: string;
  /** "mailto:...", "tel:+1...", "https://...". Omit for plain text. */
  href?: string;
}

/**
 * One job.
 *
 * Company, location and dates are three fields rather than one pre-joined
 * string, so the interpunct separators stay the RENDERER's decision. The copy
 * laws say the role header is two stacked lines with "Company · Location ·
 * Dates" on the second; a content file that hardcoded those dots would let a
 * variant quietly use a different separator.
 */
export interface ResumeRole {
  /** Line 1 of the header, e.g. "Design Engineer, Founder". */
  title: string;
  company: string;
  location: string;
  /** As written, e.g. "July 2021 - Present". Hyphens, never an em-dash. */
  dates: string;
  bullets: string[];
  /**
   * The optional "Clients include: ..." line under the bullets.
   *
   * A separate field rather than a final bullet: it is an attribution, not an
   * accomplishment, it is set differently, and a parser reading the bullet list
   * as a list of achievements should not find a list of company names in it.
   */
  clientsLine?: string;
}

/** One row of the skills block: a label and the values under it. */
export interface ResumeSkillGroup {
  /** "Languages", "Frameworks", "CMS", "Platforms", "AI". */
  label: string;
  /**
   * An array, joined by the renderer into a single text node.
   *
   * Typed as items so a variant can add or drop one without re-punctuating a
   * string, but rendered as one run so the PDF's text layer holds one
   * continuous line rather than a sequence of positioned fragments a parser has
   * to reassemble.
   */
  items: string[];
}

export interface ResumeEducation {
  /** "B.A. Interactive Media Design" */
  credential: string;
  /** "Alverno College" */
  school: string;
}

/**
 * The optional Projects section, between Experience and Skills.
 *
 * A flat list of strings rather than a {name, description} pair, because the
 * source documents do not distinguish the two: each entry is authored as one
 * sentence that happens to open with a domain. Splitting on the first colon
 * would be the renderer inventing a structure the writer did not use, and it
 * would break the first time an entry did not have one.
 *
 * Optional because it is genuinely per-variant: the cuts aimed at engineering
 * organisations carry it, the base resume does not.
 */
export type ResumeProject = string;

export interface ResumeContent {
  /**
   * Names the file, not the person. Appears in the <title> of a variant route
   * so two open tabs are tellable apart, and nowhere on the page itself.
   */
  variant: string;
  name: string;
  /** The line under the name, e.g. "Design Engineer". */
  title: string;
  contact: ResumeContactItem[];
  summary: string;
  /** Newest first. The DOM order IS the reading order. */
  experience: ResumeRole[];
  /** Omitted entirely when a variant does not carry a Projects section. */
  projects?: ResumeProject[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
  /**
   * Roughly 155 characters, for <meta name="description">. Not rendered.
   *
   * Its own field rather than a truncation of `summary`, because `summary` is
   * 400+ characters of prose written to be read by a person at the top of a
   * page, and a search-result snippet is a different job at a different length.
   * Truncating one into the other produces a description that ends mid-clause.
   */
  metaDescription: string;
  /**
   * ISO date, hand-maintained. Feeds the sitemap's lastmod for /resume, which
   * has no WordPress record behind it to ask. See lib/queries/sitemap.ts.
   */
  updated: string;
}

/**
 * Runtime validation for content that did not come through the type system.
 *
 * The tailored variants are JSON read off disk rather than imported modules
 * (see lib/resume/variants.ts for why), so TypeScript has checked nothing about
 * them by the time they arrive. This is the boundary where that gets fixed.
 *
 * It checks shape, not sense: enough that a hand-edited file fails loudly at
 * the point of reading rather than rendering as a resume with three fields
 * silently missing. A resume that is quietly half-empty is worse than one that
 * refuses to build.
 */
export function isResumeContent(value: unknown): value is ResumeContent {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Record<string, unknown>;

  const isFilledString = (input: unknown): input is string =>
    typeof input === "string" && input.trim().length > 0;

  const isStringArray = (input: unknown): boolean =>
    Array.isArray(input) && input.every(isFilledString);

  if (
    !isFilledString(draft.variant) ||
    !isFilledString(draft.name) ||
    !isFilledString(draft.title) ||
    !isFilledString(draft.summary) ||
    !isFilledString(draft.metaDescription) ||
    !isFilledString(draft.updated)
  ) {
    return false;
  }

  if (
    !Array.isArray(draft.contact) ||
    !draft.contact.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const contact = item as Record<string, unknown>;
      return (
        isFilledString(contact.label) &&
        (contact.href === undefined || isFilledString(contact.href))
      );
    })
  ) {
    return false;
  }

  if (
    !Array.isArray(draft.experience) ||
    draft.experience.length === 0 ||
    !draft.experience.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const role = item as Record<string, unknown>;
      return (
        isFilledString(role.title) &&
        isFilledString(role.company) &&
        isFilledString(role.location) &&
        isFilledString(role.dates) &&
        isStringArray(role.bullets) &&
        (role.clientsLine === undefined || isFilledString(role.clientsLine))
      );
    })
  ) {
    return false;
  }

  // Absent is valid; present but malformed is not. `undefined` and `[]` are
  // different answers and the renderer treats them the same way, so both pass.
  if (draft.projects !== undefined && !isStringArray(draft.projects)) {
    return false;
  }

  if (
    !Array.isArray(draft.skills) ||
    !draft.skills.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const group = item as Record<string, unknown>;
      return isFilledString(group.label) && isStringArray(group.items);
    })
  ) {
    return false;
  }

  return (
    Array.isArray(draft.education) &&
    draft.education.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const entry = item as Record<string, unknown>;
      return isFilledString(entry.credential) && isFilledString(entry.school);
    })
  );
}
