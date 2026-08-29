import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import MiniControls from './MiniControls';
import { MinPlayerHeight } from './Constants';
import TrackAlbumArt from './Artwork';
import PlayerTopInfo from './PlayerTopInfo';
import { styles } from '../style';
import TrackInfo from './TrackInfo';
import PlayerControls from '../player/controls/PlayerProgressControls';
import Lrc from './Lrc';
import ProgressBar from './ProgressBar';
import { useNoxSetting } from '@stores/useApp';
import { useMiniplayerHeight } from '@contexts/MiniPlayerHeightContext';
import { getIPhonePlayerMetrics } from '@components/ios/iPhoneLayout';

const SnapToRatio = 0.12;

export default function MiniplayerView() {
  const [lrcVisible, setLrcVisible] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const metrics = getIPhonePlayerMetrics({
    width,
    height,
    topInset: insets.top,
    bottomInset: insets.bottom,
  });
  const miniplayerHeight = useMiniplayerHeight();
  const artworkOpacity = useSharedValue(1);
  const initHeight = useSharedValue(0);
  const expandCounter = useNoxSetting(state => state.expandCounter);

  const miniplayerVisibleCounter = useNoxSetting(
    state => state.miniplayerVisibleCounter,
  );
  const sliding = useNoxSetting(state => state.miniProgressSliding);

  const opacityVisible = useDerivedValue(() => {
    const revealStart = Math.max(
      MinPlayerHeight * 2,
      metrics.artworkTop + metrics.artworkSize * 0.55,
    );
    if (miniplayerHeight.value <= revealStart) return 0;
    return Math.min(
      1,
      ((miniplayerHeight.value - revealStart) /
        Math.max(1, height - revealStart)) *
        2.2,
    );
  }, [height, metrics.artworkSize, metrics.artworkTop]);

  const lrcOpacity = useDerivedValue(() => 1 - artworkOpacity.value);

  const dragPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    miniplayerHeight.value = Math.max(0, Math.min(newHeight, height));
  };

  const transitionHeight = (toHeight: number, animation = true) => {
    'worklet';
    miniplayerHeight.value = animation
      ? withTiming(toHeight, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        })
      : toHeight;
    artworkOpacity.value = withTiming(1, { duration: 180 });
  };

  const expand = (animation = true, toHeight = -1) => {
    'worklet';
    if (toHeight === -1) toHeight = height;
    transitionHeight(toHeight, animation);
    scheduleOnRN(setLrcVisible, false);
  };

  const collapse = (animation = true, toHeight = -1) => {
    'worklet';
    if (toHeight === -1) toHeight = MinPlayerHeight;
    transitionHeight(toHeight, animation);
    scheduleOnRN(setLrcVisible, false);
  };

  const hide = (animation = true) => {
    'worklet';
    transitionHeight(0, animation);
  };

  const show = (animation = true) => {
    'worklet';
    miniplayerHeight.value === 0 &&
      transitionHeight(MinPlayerHeight, animation);
  };

  const onArtworkPress = () => {
    if (artworkOpacity.value === 1) {
      artworkOpacity.value = withTiming(0, { duration: 160 }, () => {
        scheduleOnRN(setLrcVisible, true);
      });
      return;
    }
    if (artworkOpacity.value === 0) {
      setLrcVisible(false);
      artworkOpacity.value = withTiming(1, { duration: 160 });
    }
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (miniplayerHeight.value < MinPlayerHeight * 0.7) return hide();
    if (translationY > height * SnapToRatio) return collapse();
    if (translationY < -height * SnapToRatio) return expand();

    const midpoint = height * 0.52;
    return miniplayerHeight.value > midpoint ? expand() : collapse();
  };

  const scrollDragGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-6, 6])
        .onStart(() => (initHeight.value = miniplayerHeight.value))
        .onChange(e => dragPlayerHeight(e.translationY))
        .onEnd(e => snapPlayerHeight(e.translationY)),
    [height],
  );

  const disabledGesture = React.useMemo(() => Gesture.Manual(), []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: miniplayerHeight.value,
    opacity: Math.min(1, miniplayerHeight.value / MinPlayerHeight),
  }));

  useEffect(() => {
    expand();
  }, [expandCounter]);

  useEffect(() => {
    show();
  }, [miniplayerVisibleCounter]);

  useEffect(() => {
    useNoxSetting.setState({ collapse, expand });
  }, [height]);

  return (
    <GestureDetector
      gesture={lrcVisible || sliding ? disabledGesture : scrollDragGesture}
    >
      <Animated.View style={[mStyles.player, animatedStyle]}>
        <View style={styles.rowView}>
          <PlayerTopInfo opacity={opacityVisible} collapse={collapse} />
          <TrackAlbumArt
            miniplayerHeight={miniplayerHeight}
            opacity={artworkOpacity}
            onPress={onArtworkPress}
            expand={expand}
            expandedSize={metrics.artworkSize}
            expandedTop={metrics.artworkTop}
            expandedRadius={metrics.cornerRadius}
          />
          <MiniControls miniplayerHeight={miniplayerHeight} expand={expand} />
        </View>
        <ProgressBar miniplayerHeight={miniplayerHeight} />
        <Lrc
          visible={lrcVisible}
          opacity={lrcOpacity}
          onPress={onArtworkPress}
        />
        <TrackInfo
          opacity={opacityVisible}
          artworkOpacity={artworkOpacity}
          style={{
            width: '100%',
            position: 'absolute',
            top: metrics.metadataTop,
            paddingHorizontal: metrics.horizontalPadding,
          }}
        />
        <PlayerControls
          opacity={opacityVisible}
          style={{
            width: '100%',
            position: 'absolute',
            top: metrics.controlsTop,
            paddingHorizontal: metrics.horizontalPadding,
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const mStyles = {
  player: {
    width: '100%' as const,
    overflow: 'hidden' as const,
  },
};
