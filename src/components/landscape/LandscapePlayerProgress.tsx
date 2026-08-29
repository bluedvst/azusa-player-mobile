import { StyleSheet, View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

import { Progress } from '@components/player/controls/ProgressBars/Progress';
import PlayerControls from './PlayerControlsSquared';
import { useNoxSetting } from '@stores/useApp';
import { isIOS } from '@utils/RNUtils';

interface Props {
  panelWidth: number;
}

export default function LandscapePlayerProgress({ panelWidth }: Props) {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const proportionalIconSize = (panelWidth * 0.6) / 5;
  const iconSize = isIOS
    ? Math.min(38, Math.max(30, proportionalIconSize))
    : proportionalIconSize;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: playerStyle.colors.background,
          width: panelWidth,
          height: iconSize + (isIOS ? 62 : 78),
        },
      ]}
    >
      <Progress live={track?.isLiveStream} />
      <PlayerControls iconSize={iconSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
  },
});
