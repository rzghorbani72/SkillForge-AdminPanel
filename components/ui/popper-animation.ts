/**
 * Transform origin for popper overlays (dropdown, popover, select, tooltip) so
 * the open animation runs along the axis the overlay extends on: a menu placed
 * below its trigger grows straight down from its top edge, like a native select.
 *
 * Radix ships `--radix-*-content-transform-origin`, but it anchors the origin to
 * the aligned *corner*, so menus appear to open diagonally. It also maps
 * `align="start|end"` to a hardcoded physical `0%|100%` that Floating UI mirrors
 * under `dir="rtl"`, which points it at the opposite corner in Persian. Keying
 * off `data-side` alone avoids both problems — side is physical, so it needs no
 * RTL handling.
 */
export const popperOrigin = [
  'data-[side=bottom]:origin-top',
  'data-[side=top]:origin-bottom',
  'data-[side=left]:origin-right',
  'data-[side=right]:origin-left'
].join(' ');
