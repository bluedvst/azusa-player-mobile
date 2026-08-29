import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BiliSearchbar from './BiliSearch/BiliSearchbar';
import usePlaylist from './usePlaylistRN';
import SongList from './SongList/View';
import MenuSheet from './MenuSheet';
import { useNoxSetting } from '@stores/useApp';
import { useIsLandscape } from '@hooks/useOrientation';
import { isIOS } from '@utils/RNUtils';

const Playlist = () => {
  const isLandscape = useIsLandscape();
  const insets = useSafeAreaInsets();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const usedPlaylist = usePlaylist(currentPlaylist);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: isLandscape ? insets.top / 2 : insets.top,
          backgroundColor: isIOS
            ? playerStyle.colors.background
            : 'transparent',
        },
      ]}
    >
      <MenuSheet usedPlaylist={usedPlaylist} />
      <BiliSearchbar onSearched={() => usedPlaylist.scrollTo({ toIndex: 0 })} />
      <SongList usedPlaylist={usedPlaylist} />
    </View>
  );
};

export default Playlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
  },
});
