import React from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { useNoxSetting } from '@stores/useApp';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import { UsePlaylistRN } from '../usePlaylistRN';

interface Props {
  usedPlaylist: UsePlaylistRN;
}

export default function SongListHeader({ usedPlaylist }: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {
    toggleSelectedAll,
    checking,
    setChecking,
    searching,
    setSearching,
    onBackPress,
    scrollTo,
  } = usedPlaylist;

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [checking, onBackPress, searching, setChecking, setSearching]),
  );

  const activeColor =
    playerStyle.colors.secondaryContainer ??
    playerStyle.customColors.playlistDrawerBackgroundColor;

  const iconColor = playerStyle.colors.onSurface;

  return (
    <View style={styles.header}>
      <View style={styles.playlistInfo}>
        <PlaylistInfo
          onPressed={() => scrollTo({ viewPosition: 0.5 })}
          usePlaylist={usedPlaylist}
        />
      </View>
      <View style={styles.actions}>
        {checking && (
          <IconButton
            icon="select-all"
            onPress={toggleSelectedAll}
            size={21}
            iconColor={iconColor}
            style={styles.actionButton}
          />
        )}
        <IconButton
          icon="check-circle-outline"
          onPress={() => setChecking(val => !val)}
          size={21}
          iconColor={iconColor}
          style={styles.actionButton}
          containerColor={checking ? activeColor : undefined}
        />
        <IconButton
          icon="magnify"
          onPress={() => setSearching(val => !val)}
          size={22}
          iconColor={iconColor}
          style={styles.actionButton}
          mode={searching ? 'contained-tonal' : undefined}
          containerColor={searching ? activeColor : undefined}
        />
        <View style={styles.menuButton}>
          <PlaylistMenuButton disabled={checking} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  playlistInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    margin: 0,
    borderRadius: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
