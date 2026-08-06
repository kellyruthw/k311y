import { isVideo, mediaUrl } from "@/lib/acf";

/**
 * Cards for the WorkCardGrid.
 *
 * These are not part of the sections query. Case studies and projects are their
 * own post types, so they are fetched alongside the page and attached to the
 * section afterwards -- the same post-fetch enrichment shape ascaya-next uses.
 */

const CARD_MEDIA = `cardMedia { node { sourceUrl mediaItemUrl mimeType altText } }`;

export const WORK_CARDS_QUERY = `
  query WorkCards {
    caseStudies(first: 100, where: { orderby: { field: TITLE, order: ASC } }) {
      nodes {
        id
        title
        slug
        caseStudyMeta {
          cardCategory
          cardSummary
          sortOrder
          featuredOnHome
          stack { stackItem }
          ${CARD_MEDIA}
        }
      }
    }
    projects(first: 100) {
      nodes {
        id
        title
        slug
        projectMeta {
          cardCategory
          tagline
          sortOrder
          ${CARD_MEDIA}
        }
      }
    }
  }
`;

interface MediaField {
  node: {
    sourceUrl: string | null;
    mediaItemUrl: string | null;
    mimeType: string | null;
    altText: string | null;
  } | null;
}

interface CaseStudyNode {
  id: string;
  title: string | null;
  slug: string | null;
  caseStudyMeta: {
    cardCategory: string | null;
    cardSummary: string | null;
    sortOrder: number | null;
    featuredOnHome: boolean | null;
    stack: { stackItem: string | null }[] | null;
    cardMedia: MediaField | null;
  } | null;
}

interface ProjectNode {
  id: string;
  title: string | null;
  slug: string | null;
  projectMeta: {
    cardCategory: string | null;
    tagline: string | null;
    sortOrder: number | null;
    cardMedia: MediaField | null;
  } | null;
}

export interface WorkCardsQueryResult {
  caseStudies: { nodes: CaseStudyNode[] } | null;
  projects: { nodes: ProjectNode[] } | null;
}

/** What a card needs to render, with the two post types already reconciled. */
export interface WorkCard {
  id: string;
  href: string;
  /** The entry name, e.g. "Ascaya". */
  name: string;
  /** Mono eyebrow beside the name, e.g. "Headless WordPress". */
  category: string | null;
  /** The large display line under the media. */
  title: string | null;
  media: { src: string; isVideo: boolean; alt: string } | null;
  /** Chips on the hover annotation. Case studies only. */
  stack: string[];
}

/** Cards grouped by the source a tab can choose. */
export type CardsBySource = Record<string, WorkCard[]>;

function toMedia(field: MediaField | null | undefined, alt: string) {
  const node = field?.node;
  const src = mediaUrl(node);
  if (!src) return null;

  return { src, isVideo: isVideo(node), alt: node?.altText || alt };
}

function bySortOrder(a: { sortOrder: number }, b: { sortOrder: number }) {
  return a.sortOrder - b.sortOrder;
}

export function toWorkCards(data: WorkCardsQueryResult): CardsBySource {
  const caseStudies = (data.caseStudies?.nodes ?? [])
    .filter((node) => node.caseStudyMeta?.featuredOnHome)
    .map((node) => ({
      sortOrder: node.caseStudyMeta?.sortOrder ?? 0,
      card: {
        id: node.id,
        href: `/case-studies/${node.slug ?? ""}`,
        name: node.title ?? "",
        category: node.caseStudyMeta?.cardCategory ?? null,
        title: node.caseStudyMeta?.cardSummary ?? null,
        media: toMedia(node.caseStudyMeta?.cardMedia, node.title ?? ""),
        stack: (node.caseStudyMeta?.stack ?? [])
          .map((item) => item.stackItem?.trim() ?? "")
          .filter(Boolean),
      } satisfies WorkCard,
    }))
    .sort(bySortOrder)
    .map((entry) => entry.card);

  const projects = (data.projects?.nodes ?? [])
    .map((node) => ({
      sortOrder: node.projectMeta?.sortOrder ?? 0,
      card: {
        id: node.id,
        href: `/projects/${node.slug ?? ""}`,
        name: node.title ?? "",
        category: node.projectMeta?.cardCategory ?? null,
        title: node.projectMeta?.tagline ?? null,
        media: toMedia(node.projectMeta?.cardMedia, node.title ?? ""),
        stack: [],
      } satisfies WorkCard,
    }))
    .sort(bySortOrder)
    .map((entry) => entry.card);

  return { case_study: caseStudies, project: projects };
}
