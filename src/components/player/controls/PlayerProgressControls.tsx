import { StyleSheet } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Progress } from './ProgressBars/Progress';
import { PlayerControls } from './PlayerControls';

export default function PlayerProgressControls({
  opacity,
  style,
}: NoxComponent.OpacityProps) {
  const track = useActiveTrack();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Progress live={track?.isLiveStream} />
      <PlayerControls />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
