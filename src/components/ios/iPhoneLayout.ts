export interface IPhonePlayerMetricsInput {
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
}

/**
 * Shared iPhone-first layout metrics.
 *
 * The legacy player positioned most of the expanded UI using the raw screen
 * width. On tall iPhones that made the album art edge-to-edge and pushed the
 * metadata/controls far down the screen. These metrics keep the important
 * controls inside the safe, thumb-reachable area while still scaling down for
 * iPhone SE-sized displays.
 */
export const getIPhonePlayerMetrics = ({
  width,
  height,
  topInset,
  bottomInset,
}: IPhonePlayerMetricsInput) => {
  const compact = width <= 375 || height <= 700;
  const horizontalPadding = compact ? 20 : 28;
  const maxArtwork = compact ? 300 : 368;
  const heightBoundArtwork = height * (compact ? 0.36 : 0.39);
  const artworkSize = Math.max(
    220,
    Math.min(width - horizontalPadding * 2, maxArtwork, heightBoundArtwork),
  );
  const artworkTop = topInset + (compact ? 36 : 48);
  const metadataTop = artworkTop + artworkSize + (compact ? 18 : 24);
  const controlsTop = metadataTop + (compact ? 100 : 112);

  return {
    compact,
    horizontalPadding,
    artworkSize,
    artworkTop,
    metadataTop,
    controlsTop,
    bottomInset,
    playerHeight: height,
    cornerRadius: compact ? 18 : 22,
    miniCornerRadius: 14,
  };
};
