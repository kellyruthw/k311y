/**
 * How long the home hero's entrance takes, and the parts it is built from.
 *
 * One file so the timeline and anything sequenced behind it cannot drift. This
 * replaced a promise-based gate -- the hero announcing when it had finished and
 * WorkCardGrid awaiting it -- which was more machinery than the problem needed:
 * the only thing the second animation has to know is how long to hold off, and
 * that is a number, not an event.
 */

/** The lead line, the only part given room of its own. */
export const HERO_LEAD = 0.5;

/** Every part after it: tail, paragraph, nowline. */
export const HERO_PART = 0.36;

/** The highlight box wiping in behind the marked words. */
export const HERO_BOX = 0.45;

/**
 * The whole sequence, end to end.
 *
 * The same arithmetic the timeline runs, written once: each part's duration
 * less the overlap it takes out of the one before. Because it is derived from
 * the three constants above rather than measured off a stopwatch, retuning the
 * hero moves this with it instead of leaving a stale figure behind.
 */
export const HERO_TOTAL =
  HERO_LEAD +
  (HERO_PART - HERO_LEAD * 0.6) +
  HERO_BOX +
  (HERO_PART - HERO_BOX * 0.55) +
  (HERO_PART - HERO_PART * 0.75);
