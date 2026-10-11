export type HomeBannerPlacement = "top" | "mid";

export const HOME_BANNER_SIDE_PADDING = 16;
export const HOME_BANNER_GAP = 10;
export const HOME_BANNER_BORDER_RADIUS = 40;

/** Design sizes (pt) */
const TOP_BANNER_DESIGN = { width: 343, height: 188 };
const MID_BANNER_DESIGN = { width: 316, height: 116 };

export function getHomeBannerLayout(
  screenWidth: number,
  placement: HomeBannerPlacement = "top",
) {
  const design =
    placement === "mid" ? MID_BANNER_DESIGN : TOP_BANNER_DESIGN;
  const maxWidth = screenWidth - HOME_BANNER_SIDE_PADDING * 2;
  // Scale from top design width so mid stays 316 when top is 343
  const scale = maxWidth / TOP_BANNER_DESIGN.width;
  const width = design.width * scale;
  const height = design.height * scale;
  const sidePadding = (screenWidth - width) / 2;

  return {
    width,
    height,
    sidePadding,
    gap: HOME_BANNER_GAP,
    snapInterval: width + HOME_BANNER_GAP,
    borderRadius: HOME_BANNER_BORDER_RADIUS,
  };
}
