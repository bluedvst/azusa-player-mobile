import React, { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { ScreenIcons } from '@enums/Icons';
import RandomGIFButton from '../buttons/RandomGIF';
import useNavigation from '@hooks/useNavigation';
import { useNoxSetting } from '@stores/useApp';
import { NoxRoutes } from '@enums/Routes';
import { logger } from '@utils/Logger';
import { isIOS } from '@utils/RNUtils';

interface Props {
  panelWidth?: number;
}
export default function LandscapeActions({ panelWidth = 110 }: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const navigation = useNavigation();
  const iconSize = isIOS ? 23 : Math.max(22, panelWidth - 30);

  const onPlaylistPress = () => {
    navigation.navigate({
      route:
        navigation.getState()?.routes?.at(-1)?.name === NoxRoutes.Playlist
          ? NoxRoutes.PlaylistsDrawer
          : NoxRoutes.Playlist,
    });
  };

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate({ route: NoxRoutes.Playlist });
      }
    }
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  const buttonStyle = isIOS
    ? [styles.button, { backgroundColor: playerStyle.colors.surface }]
    : undefined;

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: panelWidth,
          backgroundColor: isIOS
            ? playerStyle.colors.background
            : playerStyle.metaData.darkTheme
              ? 'rgb(44, 40, 49)'
              : 'rgb(243, 237, 246)',
        },
      ]}
    >
      {!isIOS && (
        <View style={styles.randomGifButtonContainerStyle}>
          <RandomGIFButton
            gifs={playerStyle.gifs}
            favList={String(currentPlayingId)}
            iconsize={iconSize}
          />
        </View>
      )}
      <View style={styles.actions}>
        <IconButton
          icon={ScreenIcons.HomeScreen}
          size={iconSize}
          iconColor={playerStyle.colors.onSurface}
          style={buttonStyle}
          onPress={() => navigation.navigate({ route: NoxRoutes.Lyrics })}
        />
        <IconButton
          icon={ScreenIcons.PlaylistScreen}
          size={iconSize}
          iconColor={playerStyle.colors.onSurface}
          style={buttonStyle}
          onPress={onPlaylistPress}
        />
        <IconButton
          icon={ScreenIcons.ExploreScreen}
          size={iconSize}
          iconColor={playerStyle.colors.onSurface}
          style={buttonStyle}
          onPress={() => navigation.navigate({ route: NoxRoutes.Explore })}
        />
        <IconButton
          icon={ScreenIcons.SettingScreen}
          size={iconSize}
          iconColor={playerStyle.colors.onSurface}
          style={buttonStyle}
          onPress={() => navigation.navigate({ route: NoxRoutes.Settings })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: 44,
    height: 44,
    margin: 0,
    borderRadius: 14,
  },
  randomGifButtonContainerStyle: {
    paddingTop: 20,
    alignContent: 'center',
    alignItems: 'center',
  },
});
