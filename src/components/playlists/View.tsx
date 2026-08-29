/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { IconButton, Divider } from 'react-native-paper';
import { View, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RectButton } from 'react-native-gesture-handler';
import { ImageBackground } from 'expo-image';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
import { NoxRoutes } from '@enums/Routes';
import { logger } from '@utils/Logger';
import Playlists from './Playlists';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';
import useNavigation from '@hooks/useNavigation';
import FlexView from '../commonui/FlexViewNewArch';
import useDrawerStatus from '@hooks/useDrawerStatus';
import { isIOS } from '@utils/RNUtils';

interface Props {
  view: NoxRoutes;
  routeIcon?: RouteIcons;
  icon: string;
  text: string;
  navigation: DrawerNavigationHelpers;
}

const RenderDrawerItem = ({
  view,
  icon,
  text,
  routeIcon,
  navigation,
}: Props) => {
  const noxNavigation = useNavigation(navigation);
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <RectButton
      style={isIOS ? styles.drawerButtonIOS : undefined}
      onPress={() =>
        noxNavigation.navigate({
          route: view,
          setIcon: routeIcon !== undefined,
        })
      }
    >
      <View
        style={[
          styles.drawerItemContainer,
          isIOS && styles.drawerItemContainerIOS,
        ]}
      >
        <IconButton
          icon={icon}
          size={isIOS ? 21 : 32}
          iconColor={playerStyle.colors.primary}
          style={isIOS ? styles.drawerIconIOS : undefined}
        />
        <View style={styles.drawerItemTextContainer}>
          <Text
            style={[
              isIOS && styles.drawerTextIOS,
              { color: playerStyle.colors.onSurface },
            ]}
          >
            {t(text)}
          </Text>
        </View>
      </View>
    </RectButton>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BiliCard = (props: any) => {
  if (props.backgroundURI) {
    return (
      <ImageBackground source={{ uri: props.backgroundURI }}>
        {props.children}
      </ImageBackground>
    );
  }
  return <>{props.children}</>;
};

export default function PlaylistsView({
  navigation,
}: {
  navigation: DrawerNavigationHelpers;
}) {
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const toggleExpand = useNoxSetting(state => state.toggleExpand);
  const noxNavigation = useNavigation(navigation);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _drawerStatus = useDrawerStatus();

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        noxNavigation.navigate({ route: NoxRoutes.PlayerHome });
        toggleExpand();
      }
    }

    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <FlexView mkey={'drawer'}>
      <View
        style={[
          styles.content,
          { backgroundColor: playerStyle.colors.background },
        ]}
      >
        <View style={{ height: (isIOS ? 6 : 10) + insets.top }} />
        <BiliCard backgroundURI={isIOS ? undefined : playerStyle.biliGarbCard}>
          <RenderDrawerItem
            icon={'home-outline'}
            view={NoxRoutes.PlayerHome}
            text={'appDrawer.homeScreenName'}
            routeIcon={RouteIcons.music}
            navigation={navigation}
          />
        </BiliCard>
        <RenderDrawerItem
          icon={'compass-outline'}
          view={NoxRoutes.Explore}
          text={'appDrawer.exploreScreenName'}
          routeIcon={RouteIcons.explore}
          navigation={navigation}
        />
        <RenderDrawerItem
          icon={'cog-outline'}
          view={NoxRoutes.Settings}
          text={'appDrawer.settingScreenName'}
          routeIcon={RouteIcons.setting}
          navigation={navigation}
        />
        <Divider
          style={[
            isIOS && styles.dividerIOS,
            { backgroundColor: playerStyle.colors.outlineVariant },
          ]}
        />
        <Playlists navigation={navigation} />
      </View>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  drawerButtonIOS: {
    marginHorizontal: 10,
    marginVertical: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  drawerItemContainer: {
    flexDirection: 'row',
  },
  drawerItemContainerIOS: {
    minHeight: 50,
    alignItems: 'center',
  },
  drawerItemTextContainer: {
    justifyContent: 'center',
  },
  drawerIconIOS: {
    width: 42,
    height: 42,
    margin: 0,
  },
  drawerTextIOS: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dividerIOS: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
