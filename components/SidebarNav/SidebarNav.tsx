"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { requestAnchor } from "@/lib/anchors";
import type { NavLink } from "@/lib/queries/nav";
import { displayName, type NavNode } from "@/lib/navTree";
import SelectionMarquee from "./SelectionMarquee";
import styles from "./sidebarNav.module.scss";

/**
 * The mobile menu button. Rendered on every viewport and hidden above `tablet`
 * by the stylesheet rather than by a JS media query: a breakpoint read during
 * render is not knowable while server-rendering, so it would either mismatch on
 * hydration or force this whole nav to be client-only.
 *
 * `display: none` above tablet takes it out of the tab order too, so a desktop
 * reader never lands on a control that does nothing.
 */
function MenuButton({
  open,
  controls,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  controls: string;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const label = open ? "Close menu" : "Open menu";

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.menuButton}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      onClick={onToggle}
    >
      {/* Three rules that become a cross. Decorative: the label above is what
          is announced, and the state is carried by aria-expanded. */}
      <span className={styles.menuBar} aria-hidden />
      <span className={styles.menuBar} aria-hidden />
      <span className={styles.menuBar} aria-hidden />
    </button>
  );
}

/** Collapses the component tree. A disclosure, so it announces its own state. */
function TreeToggle({
  open,
  controls,
  onToggle,
}: {
  open: boolean;
  controls: string;
  onToggle: () => void;
}) {
  const label = open ? "Hide tree" : "Show tree";

  return (
    <button
      type="button"
      className={styles.caret}
      aria-expanded={open}
      aria-controls={controls}
      // The visible tooltip is decorative; this is what is announced.
      aria-label={label}
      onClick={onToggle}
    >
      <svg viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className={styles.tooltip} aria-hidden>
        {label}
      </span>
    </button>
  );
}

/**
 * SidebarNav. The layers panel.
 *
 * Two separate pieces of state, deliberately not merged:
 *
 *   hovered  a node under the pointer or keyboard focus. This alone draws the
 *            marquee over the matching sections.
 *   inView   whatever the scroll position is on. This only soft-lights its own
 *            node, and never puts a marquee on the page.
 *
 * Keeping them apart is what stops the selection idiom firing while you are
 * simply reading: the marquee is an answer to "what is this?", so it should
 * appear when asked and not before.
 */

interface SidebarNavProps {
  links: NavLink[];
  nodes: NavNode[];
  /** Which menu link is the page being viewed, or the one it lives under. */
  currentHref: string;
  /**
   * A single entry nested inside that menu item, e.g. "Ascaya" under Case
   * Studies. The component tree then hangs off the entry rather than the menu
   * item, which is the breadcrumb effect the as-built rail rules describe.
   */
  entryLabel?: string;
  wordmarkSrc: string;
}

export default function SidebarNav({
  links,
  nodes,
  currentHref,
  entryLabel,
  wordmarkSrc,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [treeOpen, setTreeOpen] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [inView, setInView] = useState<string | null>(null);
  /** The element id of the section currently at the reading line. */
  const [inViewId, setInViewId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const MENU_ID = "site-menu";

  /**
   * Escape closes and hands focus back to the button, and a press anywhere
   * outside the nav closes without stealing it.
   *
   * Both are bound only while the menu is open, so the site carries no global
   * listeners for a control that is shut, and closing tears them straight back
   * down. `pointerdown` rather than `click`: a tap that begins outside the menu
   * has already expressed the intent, and waiting for the full click leaves the
   * menu standing over whatever is being reached for.
   *
   * No focus trap. This is a short list hanging under a bar, not a modal -- it
   * does not cover the page, and tabbing past the last link onto the content
   * underneath is a reasonable thing to let someone do.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  /**
   * Every link closes the menu on its way out.
   *
   * Done on the link rather than in an effect watching the pathname: a route
   * change is the only way to leave, so the click is the honest place for it,
   * and it avoids setting state from an effect. It also covers the case an
   * effect would miss -- following a link to the page you are already on, where
   * the pathname never changes and the menu would sit there open.
   */
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /**
   * Scroll-spy: whichever section crosses the middle of the viewport is the one
   * being read.
   *
   * Deliberately not IntersectionObserver. Its intersectionRatio is measured
   * against the element's own height, so a tall section scores a fraction while
   * a short one fully inside the detection band scores 1 -- comparing them
   * means a long section can never win, and its node simply never lights.
   *
   * A midpoint test has no such bias: a section is current for exactly as long
   * as the reading line is inside it, whatever its height.
   */
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-component]"));
    if (!sections.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;

      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });

      setInView(current?.dataset.component ?? null);
      setInViewId(current?.id ?? null);
    };

    // Coalesced into a frame: scroll fires far more often than the paint that
    // would show the change.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * Step through a component's instances.
   *
   * Which one comes next is decided by where you already are, not by a click
   * counter: if the section at the reading line is one of this node's, go to
   * the one after it, otherwise start at the first. So clicking MediaCopy while
   * looking at its third instance takes you to the fourth, and the count chip
   * stays honest -- the node is a way through five sections, not a link to one.
   */
  const scrollToNode = useCallback(
    (node: NavNode) => {
      const current = inViewId ? node.ids.indexOf(inViewId) : -1;
      const next = current === -1 ? 0 : (current + 1) % node.ids.length;

      const target = node.ids[next] && document.getElementById(node.ids[next]);
      if (!target) return;

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    },
    [inViewId],
  );

  return (
    <>
      <nav
        ref={panelRef}
        className={styles.panel}
        aria-label="Page structure"
        data-menu-open={menuOpen}
      >
        {/*
          The bar. On desktop it is only a wrapper around the wordmark and the
          panel reads exactly as it did. On mobile it is the whole nav in its
          resting state: logotype left, menu button right.
        */}
        <div className={styles.bar}>
          <Link href="/" className={styles.wordmark} onClick={closeMenu}>
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size
                outlined logotype; next/image has nothing to optimise here. */}
            <img src={wordmarkSrc} alt="Kelly Warpechowski" width={201} height={25} />
          </Link>

          <MenuButton
            open={menuOpen}
            controls={MENU_ID}
            buttonRef={menuButtonRef}
            onToggle={() => setMenuOpen((open) => !open)}
          />
        </div>

        <div className={styles.tree} id={MENU_ID}>
          <ul className={styles.pages}>
            {links.map((link) => {
              const isCurrent = link.href === currentHref;

              // An anchor is only handled in-page when we are already on the
              // page it points at. From elsewhere it is a normal navigation,
              // and the destination reads the hash on arrival.
              const isSamePageAnchor = Boolean(link.hash) && link.path === pathname;

              const hasTree = isCurrent && nodes.length > 0;
              const treeId = `${link.id}-tree`;

              return (
                <li
                  key={link.id}
                  className={styles.page}
                  data-current={isCurrent}
                  data-open={hasTree ? treeOpen : undefined}
                >
                  <div className={styles.squareRow}>
                    {isSamePageAnchor ? (
                    // Handled here rather than by the router: an in-page anchor
                    // has to open a tab as well as scroll, and there is no
                    // element with this id for a browser jump to land on.
                    <a
                      href={link.href}
                      className={styles.square}
                      onClick={(event) => {
                        event.preventDefault();
                        closeMenu();
                        requestAnchor(link.hash as string);
                      }}
                    >
                      <span className={styles.squareLabel}>{link.label}</span>
                    </a>
                  ) : link.isExternal ? (
                    <a href={link.href} className={styles.square} onClick={closeMenu}>
                      <span className={styles.squareLabel}>{link.label}</span>
                    </a>
                  ) : (
                      <Link
                        href={link.href}
                        className={styles.square}
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={closeMenu}
                      >
                        <span className={styles.squareLabel}>{link.label}</span>
                      </Link>
                    )}

                    {/* The toggle rides whichever square the tree hangs off. */}
                    {hasTree && !entryLabel ? (
                      <TreeToggle
                        open={treeOpen}
                        controls={treeId}
                        onToggle={() => setTreeOpen((open) => !open)}
                      />
                    ) : null}
                  </div>

                  {/*
                    Only the page being viewed expands. On a case study the tree
                    hangs off a nested entry square rather than the menu item,
                    giving the breadcrumb effect: Case Studies > Ascaya > tree.
                  */}
                  {isCurrent && entryLabel ? (
                    <div className={styles.entryRow}>
                      <p className={styles.entry}><span className={styles.squareLabel}>{entryLabel}</span></p>

                      {hasTree ? (
                        <TreeToggle
                          open={treeOpen}
                          controls={treeId}
                          onToggle={() => setTreeOpen((open) => !open)}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {hasTree ? (
                    <div className={styles.branchWrap} id={treeId}>
                    <ul className={styles.branch} data-nested={Boolean(entryLabel)}>
                      {nodes.map((node) => (
                        <li key={node.name} className={styles.node}>
                          <button
                            type="button"
                            className={styles.circle}
                            data-active={hovered === node.name}
                            data-inview={inView === node.name}
                            onPointerEnter={() => setHovered(node.name)}
                            onPointerLeave={() => setHovered(null)}
                            onFocus={() => setHovered(node.name)}
                            onBlur={() => setHovered(null)}
                            onClick={() => scrollToNode(node)}
                          >
                            <span className={styles.circleLabel}>{node.label}</span>
                            {node.count > 1 ? (
                              <span className={styles.count}>
                                <span className={styles.countText}>{node.count}</span>
                              </span>
                            ) : null}
                          </button>

                          {node.subcomponent ? (
                            <span className={styles.diamond} aria-hidden>
                              <span className={styles.diamondShape} />
                              <span className={styles.diamondLabel}>{node.subcomponent}</span>
                            </span>
                          ) : null}
                        </li>
                      ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {/*
          Colophon is hidden until the page behind it exists. It is still very
          much wanted -- see Phase 4 in _content-source/design-docket.md, which
          has the full spec -- but /colophon has no route, so the link 404s from
          every page on the site, which is worse than not offering it yet.

          Restoring it is this element and nothing else: .colophon is still in
          the stylesheet, and .tree's flex-grow already reserves the bottom of
          the panel for it.
        */}
      </nav>

      {/* Only a deliberate hover draws the marquee, never the scroll position. */}
      <SelectionMarquee component={hovered} label={hovered ? displayName(hovered) : null} />
    </>
  );
}
