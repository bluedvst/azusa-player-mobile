import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import '../../localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LandscapePlayerPanel from './LandscapePlayerPanel';
import LandscapeActions from './LandscapeActions';
import LandscapePlaylistPanel from './LandscapePlaylistPanel';
import { useNoxSetting } from '@stores/useApp';
import { isIOS } from '@utils/RNUtils';

const AzusaPlayer = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const horizontalSafeArea = insets.left + insets.right;
  const usableWidth = Math.max(0, width - horizontalSafeArea);
  const actionPanelWidth = isIOS ? 62 : Math.max(50, Math.min(120, height / 5));
  const contentWidth = Math.max(0, usableWidth - actionPanelWidth);
  const playerPanelWidth = isIOS
    ? Math.min(390, Math.max(280, contentWidth * 0.47))
    : Math.max(50, contentWidth / 2);
  const playlistPanelWidth = Math.max(0, contentWidth - playerPanelWidth);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: playerStyle.colors.background,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: isIOS ? Math.min(insets.bottom, 12) : 0,
        },
      ]}
    >
      <LandscapeActions panelWidth={actionPanelWidth} />
      <LandscapePlayerPanel panelWidth={playerPanelWidth} />
      <LandscapePlaylistPanel panelWidth={playlistPanelWidth} />
    </View>
  );
};

export default AzusaPlayer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
});
