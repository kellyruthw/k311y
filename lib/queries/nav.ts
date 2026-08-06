import { fetchGraphQL } from "@/lib/graphql";

/**
 * The primary menu. Authored in WordPress under Appearance -> Menus, so the
 * page list and its order are content rather than code.
 */

const PRIMARY_MENU_QUERY = `
  query PrimaryMenu {
    # MENU_1 is the enum for the theme's "menu-1" location, which is where the
    # Primary menu is assigned. Not PRIMARY -- the enum follows the location
    # slug the theme registered, not the menu's name.
    menuItems(where: { location: MENU_1 }, first: 50) {
      nodes {
        id
        label
        uri
        order
        parentId
      }
    }
  }
`;

interface MenuItemNode {
  id: string;
  label: string | null;
  uri: string | null;
  order: number | null;
  parentId: string | null;
}

interface PrimaryMenuResult {
  menuItems: { nodes: MenuItemNode[] } | null;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  /** The route part, without the hash. "/" for a bare anchor. */
  path: string;
  /** The fragment, without the "#". Null when the link is a plain route. */
  hash: string | null;
  /** mailto: and other non-http schemes leave the site. */
  isExternal: boolean;
}

export async function getPrimaryMenu(): Promise<NavLink[]> {
  const data = await fetchGraphQL<PrimaryMenuResult>(PRIMARY_MENU_QUERY);

  return (data.menuItems?.nodes ?? [])
    .filter((node) => !node.parentId && node.label)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((node) => {
      const href = node.uri ?? "/";
      const isExternal = /^[a-z]+:/i.test(href) && !href.startsWith("/");

      // WordPress writes these as "/#projects", not "#projects", so the hash
      // has to be found rather than assumed to start the string.
      const hashAt = isExternal ? -1 : href.indexOf("#");
      const path = hashAt === -1 ? href : href.slice(0, hashAt) || "/";
      const hash = hashAt === -1 ? null : href.slice(hashAt + 1) || null;

      return {
        id: node.id,
        label: node.label as string,
        href,
        path: isExternal ? href : path,
        hash,
        isExternal,
      };
    });
}
