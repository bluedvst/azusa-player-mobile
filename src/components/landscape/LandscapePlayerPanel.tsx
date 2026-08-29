import { StyleSheet, View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import React from 'react';

import TrackInfoTemplate from '../player/TrackInfo/TrackInfoTemplate';
import LandscapePlayerProgress from './LandscapePlayerProgress';
import { useNoxSetting } from '@stores/useApp';
import { isIOS } from '@utils/RNUtils';

interface Props {
  panelWidth: number;
}

export default function LandscapePlayerPanel({ panelWidth }: Props) {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        styles.container,
        {
          width: panelWidth,
          backgroundColor: playerStyle.colors.background,
        },
      ]}
    >
      <TrackInfoTemplate
        track={track}
        windowWidth={panelWidth}
        containerStyle={[
          styles.trackInfo,
          isIOS && styles.trackInfoIOS,
        ]}
      >
        <></>
      </TrackInfoTemplate>
      <LandscapePlayerProgress panelWidth={panelWidth} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackInfoIOS: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
