import { IconButton } from 'react-native-paper';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { fadePause } from '@utils/RNTPUtils';
import useTPControls from '@hooks/useTPControls';
import usePlaybackState from '@hooks/usePlaybackState';
import { useTrackStore } from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { TPPlay } from '@stores/RNObserverStore';
import ActivityIndicator from '@components/commonui/ActivityIndicator';

const IconSize = 25;

const TrackInfo = () => {
  const track = useTrackStore(s => s.track);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={mStyles.infoContainer}>
      <Text
        testID={'miniplayer-track-title'}
        numberOfLines={1}
        style={[
          mStyles.title,
          { color: playerStyle.colors.onSurface },
        ]}
      >
        {track?.title}
      </Text>
      <Text
        testID={'miniplayer-track-artist'}
        numberOfLines={1}
        style={[
          mStyles.artist,
          { color: playerStyle.colors.onSurfaceVariant },
        ]}
      >
        {track?.artist}
      </Text>
    </View>
  );
};

interface Props extends NoxComponent.MiniplayerProps {
  expand: () => void;
}

export default function MiniplayerControls({
  miniplayerHeight,
  expand,
}: Props) {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const { width } = useWindowDimensions();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const compact = width <= 375;

  const miniControlOpacity = useDerivedValue(() =>
    interpolate(
      miniplayerHeight.value,
      [MinPlayerHeight, MinPlayerHeight * 2.25],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: miniControlOpacity.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={expand}>
      <Animated.View style={[mStyles.container, animatedStyle]}>
        <TrackInfo />
        {!compact && (
          <IconButton
            iconColor={playerStyle.colors.primary}
            icon="skip-previous"
            size={IconSize}
            style={mStyles.iconButton}
            onPress={performSkipToPrevious}
          />
        )}
        <PlayPauseButton />
        <IconButton
          iconColor={playerStyle.colors.primary}
          icon="skip-next"
          size={IconSize}
          style={mStyles.iconButton}
          onPress={() => performSkipToNext()}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const PlayPauseButton = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { showPause, showBuffering } = usePlaybackState();

  if (showBuffering) {
    return <ActivityIndicator size={21} style={mStyles.iconButton} />;
  }

  return (
    <IconButton
      iconColor={playerStyle.colors.primary}
      icon={showPause ? 'pause' : 'play'}
      size={IconSize + 2}
      style={mStyles.iconButton}
      onPress={showPause ? fadePause : TPPlay}
    />
  );
};

const mStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: MinPlayerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  infoContainer: {
    flex: 1,
    height: MinPlayerHeight,
    justifyContent: 'center',
    paddingLeft: MinPlayerHeight + 4,
    paddingRight: 6,
  },
  title: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  artist: {
    marginTop: 1,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '400',
  },
  iconButton: {
    width: 42,
    height: MinPlayerHeight,
    margin: 0,
  },
});
