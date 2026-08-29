import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import RandomGIFButton from '../buttons/RandomGIF';
import useNavigation from '@hooks/useNavigation';
import { NoxRoutes } from '@enums/Routes';
import { isIOS } from '@utils/RNUtils';
import { NativeText as Text } from '@components/commonui/ScaledText';

interface Props extends NoxComponent.OpacityProps {
  collapse: () => void;
}

export default function MiniplayerTopInfo({ opacity, collapse }: Props) {
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const navigation = useNavigation();
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);

  const onPressPlaylist = async () => {
    setCurrentPlaylist(await getPlaylist(currentPlayingList.id));
    navigation.navigate({
      route: NoxRoutes.PlayerHome,
      params: { screen: NoxRoutes.Playlist, pop: true },
    });
    scroll();
    collapse();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: opacity.value > 0 ? 3 : 0,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 2,
          paddingHorizontal: 10,
        },
        animatedStyle,
      ]}
    >
      <IconButton
        testID="miniplayer-collapse"
        icon={isIOS ? 'chevron-down' : 'arrow-collapse'}
        size={26}
        iconColor={playerStyle.colors.onSurface}
        style={styles.iconButton}
        onPress={collapse}
      />

      {isIOS ? (
        <View style={styles.titleContainer} pointerEvents="none">
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: playerStyle.colors.onSurfaceVariant },
            ]}
          >
            {currentPlayingList.title}
          </Text>
        </View>
      ) : (
        <View style={styles.randomGifButtonContainer}>
          <RandomGIFButton
            gifs={playerStyle.gifs}
            favList={String(currentPlayingId)}
          />
        </View>
      )}

      <IconButton
        testID="miniplayer-go2playlist"
        icon="playlist-music"
        size={25}
        iconColor={playerStyle.colors.onSurface}
        style={styles.iconButton}
        onPress={onPressPlaylist}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    maxWidth: '100%',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  randomGifButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
