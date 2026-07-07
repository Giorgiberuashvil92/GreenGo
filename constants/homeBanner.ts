export const HOME_BANNER_SIDE_PADDING = 16;
export const HOME_BANNER_GAP = 10;
export const HOME_BANNER_ASPECT = 158 / 315;
export const HOME_BANNER_BORDER_RADIUS = 40;

export function getHomeBannerLayout(screenWidth: number) {
  const width = screenWidth - HOME_BANNER_SIDE_PADDING * 2;
  const height = width * HOME_BANNER_ASPECT;

  return {
    width,
    height,
    sidePadding: HOME_BANNER_SIDE_PADDING,
    gap: HOME_BANNER_GAP,
    snapInterval: width + HOME_BANNER_GAP,
    borderRadius: HOME_BANNER_BORDER_RADIUS,
  };
}
