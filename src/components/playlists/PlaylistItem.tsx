import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { IconButton } from '../commonui/RNGHPaperWrapper';
import { isIOS } from '@utils/RNUtils';

const DefaultIcon = (
  item: NoxMedia.Playlist,
  deleteCallback: (id: string) => void,
) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <IconButton
      testID="playlist-item-delete-button"
      icon={isIOS ? 'close-circle-outline' : 'close'}
      onPress={() => deleteCallback(item.id)}
      size={isIOS ? 19 : 25}
      iconColor={playerStyle.colors.onSurfaceVariant}
      style={isIOS ? styles.trailingButtonIOS : undefined}
    />
  );
};

interface PlaylistItemProps {
  item: NoxMedia.Playlist;
  icon?: ReactNode;
  confirmOnDelete?: (id: string) => void;
  leadColor?: string;
  beginDrag?: () => void;
}

const PlaylistItem = ({
  item,
  icon,
  confirmOnDelete = () => undefined,
  leadColor,
  beginDrag,
}: PlaylistItemProps) => {
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const isPlaying = currentPlayingList.id === item?.id;

  if (!item) return <></>;

  return (
    <View style={[styles.playlistItemContainer, isIOS && styles.containerIOS]}>
      <TouchableOpacity
        style={[
          styles.dragHandle,
          isIOS && styles.dragHandleIOS,
          { backgroundColor: leadColor },
        ]}
        onPressIn={beginDrag}
      />
      <View style={styles.playlistItemTextContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            isIOS && styles.titleIOS,
            {
              color: playerStyle.colors.onSurface,
              fontWeight: isPlaying ? '700' : isIOS ? '500' : undefined,
            },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <View style={styles.playlistItemIconContainer}>
        {icon ?? DefaultIcon(item, () => confirmOnDelete(item.id))}
      </View>
    </View>
  );
};

export default PlaylistItem;

const styles = StyleSheet.create({
  playlistItemContainer: {
    flexDirection: 'row',
    minHeight: 52,
    alignItems: 'stretch',
  },
  containerIOS: {
    minHeight: 54,
    marginHorizontal: 10,
    marginVertical: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 15,
  },
  dragHandleIOS: {
    width: 4,
    marginVertical: 10,
    marginLeft: 6,
    borderRadius: 2,
  },
  playlistItemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: 10,
  },
  titleIOS: {
    fontSize: 15.5,
    lineHeight: 20,
    paddingLeft: 10,
    paddingRight: 8,
  },
  playlistItemIconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  trailingButtonIOS: {
    margin: 0,
    width: 42,
    height: 42,
  },
});
