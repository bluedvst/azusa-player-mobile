import { TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Image, useImage } from 'expo-image';

import { useTrackStore } from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';
import { songResolveArtwork } from '@utils/mediafetch/resolveURL';
import logger from '@utils/Logger';
import HorizontalCarousel from '@components/commonui/HorizontalCarousel';
import { performSkipToNext, performSkipToPrevious } from '@hooks/useTPControls';
import { playNextSong } from '@stores/playingList';
import { styles } from '../style';

interface Props extends NoxComponent.MiniplayerProps {
  opacity: SharedValue<number>;
  onPress: () => void;
  expand: () => void;
  expandedSize: number;
  expandedTop: number;
  expandedRadius: number;
}

export default function MiniplayerArtwork({
  miniplayerHeight,
  opacity,
  onPress,
  expand,
  expandedSize,
  expandedTop,
  expandedRadius,
}: Props) {
  const track = useTrackStore(s => s.track);
  const [trackCarousel, setTrackCarousel] = useState<any[]>([]);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [overwriteAlbumArt, setOverwriteAlbumArt] = useState<string | void>();
  const { width, height } = useWindowDimensions();

  const imgURI = playerSetting.hideCoverInMobile
    ? ''
    : `${overwriteAlbumArt ?? track?.artwork}`;
  const img = useImage(imgURI, {
    maxHeight:
      playerSetting.artworkRes === 0 ? undefined : playerSetting.artworkRes,
    maxWidth:
      playerSetting.artworkRes === 0 ? undefined : playerSetting.artworkRes,
    onError: () =>
      logger.warn(`[artwork] failed to load ${track?.mediaId} artwork`),
  });

  const miniSize = Math.max(44, MinPlayerHeight - 12);
  const expandedLeft = (width - expandedSize) / 2;

  const expansionProgress = useDerivedValue(() =>
    interpolate(
      miniplayerHeight.value,
      [MinPlayerHeight, height],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  );

  const artworkOpacity = useDerivedValue(() => {
    if (!track?.song?.MVHide || !track?.song?.backgroundOverride) {
      return opacity.value;
    }
    return interpolate(
      expansionProgress.value,
      [0, 1],
      [opacity.value, 0],
      Extrapolation.CLAMP,
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expansionProgress.value,
      [0, 1],
      [miniSize, expandedSize],
      Extrapolation.CLAMP,
    ),
    height: interpolate(
      expansionProgress.value,
      [0, 1],
      [miniSize, expandedSize],
      Extrapolation.CLAMP,
    ),
    left: interpolate(
      expansionProgress.value,
      [0, 1],
      [6, expandedLeft],
      Extrapolation.CLAMP,
    ),
    top: interpolate(
      expansionProgress.value,
      [0, 1],
      [6, expandedTop],
      Extrapolation.CLAMP,
    ),
    opacity: artworkOpacity.value,
    borderRadius: interpolate(
      expansionProgress.value,
      [0, 1],
      [14, expandedRadius],
      Extrapolation.CLAMP,
    ),
  }));

  const onImagePress = () => {
    if (miniplayerHeight.value < height * 0.8) return expand();
    onPress();
  };

  const refreshImageCarousel = () =>
    setTrackCarousel([
      { uri: playNextSong(-1, false)?.cover },
      img,
      { uri: playNextSong(1, false)?.cover },
    ]);

  useEffect(() => {
    songResolveArtwork(track?.song)?.then(setOverwriteAlbumArt);
  }, [track]);

  useEffect(() => {
    playerSetting.artworkCarousel && refreshImageCarousel();
  }, [img, playerSetting.artworkCarousel]);

  return (
    <TouchableWithoutFeedback onPress={onImagePress}>
      <Animated.View style={[mStyles.artworkShell, animatedStyle]}>
        {playerSetting.artworkCarousel ? (
          <HorizontalCarousel
            images={trackCarousel}
            imgStyle={{ width: expandedSize, height: expandedSize }}
            paddingVertical={0}
            callback={i =>
              i === -1 ? performSkipToNext() : performSkipToPrevious()
            }
            active={track !== undefined}
          />
        ) : (
          !playerSetting.hideCoverInMobile && (
            <Image
              style={styles.flex}
              source={img}
              transition={220}
              contentFit="cover"
            />
          )
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const mStyles = {
  artworkShell: {
    position: 'absolute' as const,
    overflow: 'hidden' as const,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
};
