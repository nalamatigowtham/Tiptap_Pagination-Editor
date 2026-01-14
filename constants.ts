export const PX_PER_INCH = 96;
export const PAGE_WIDTH_IN = 8.5;
export const PAGE_HEIGHT_IN = 11;
export const MARGIN_IN = 1;

export const PAGE_WIDTH_PX = PAGE_WIDTH_IN * PX_PER_INCH; // 816px
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_IN * PX_PER_INCH; // 1056px
export const MARGIN_PX = MARGIN_IN * PX_PER_INCH; // 96px

/**
 * Total Page Height: 1056px
 * Top Margin: 96px
 * Bottom Margin: 96px
 * Content Max Height: 864px
 * We use 860px as a safety buffer to prevent sub-pixel layout rounding 
 * from triggering accidental browser page breaks.
 */
export const PRINTABLE_HEIGHT_PX = 860; 

// Visual gap between sheets in editor UI
export const PAGE_GAP_PX = 48;