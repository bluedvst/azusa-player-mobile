import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getDrawerStatusFromState } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import useNoxMobile from '@stores/useMobile';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';
import { useIsLandscape } from '@hooks/useOrientation';
import useNavigation from '@hooks/useNavigation';

interface IconProps {
  icon: string;
  onPress: () => void;
  tint: string;
}

const BottomIconButton = ({ icon, onPress, tint }: IconProps) => {
  const active = !icon.includes('outline');
  return (
    <View style={styles.iconSlot}>
      <IconButton
        mode={active ? 'contained-tonal' : undefined}
        icon={icon}
        iconColor={tint}
        style={[styles.iconButton, active && styles.activeIconButton]}
        size={24}
        onPress={onPress}
      />
    </View>
  );
};

const NoxBottomTab = ({ navigation }: NoxComponent.NavigationProps2) => {
  const navigationG = useNavigation();
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const route = useNoxMobile(state => state.bottomTabRoute);
  const isLandscape = useIsLandscape();

  const isDrawerOpen = () =>
    navigation === undefined
      ? false
      : getDrawerStatusFromState(navigation.getState()) === 'open';

  const onDrawerPress = () => {
    if (navigation === undefined) return;
    if (isDrawerOpen()) {
      navigation.closeDrawer();
      return;
    }
    navigation.openDrawer();
  };

  const renderIcon = (icon: RouteIcons) =>
    route === icon ? icon : `${icon}-outline`;

  const surface =
    playerStyle.colors.elevation?.level2 ?? playerStyle.colors.background;
  const tint = playerStyle.colors.primary;

  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: surface,
          borderTopColor: playerStyle.colors.outlineVariant ?? 'transparent',
          paddingBottom: isLandscape ? 0 : insets.bottom,
        },
      ]}
    >
      <View style={styles.panel}>
        <BottomIconButton
          tint={tint}
          icon={renderIcon(RouteIcons.playlist)}
          onPress={onDrawerPress}
        />
        <BottomIconButton
          tint={tint}
          icon={renderIcon(RouteIcons.music)}
          onPress={() =>
            navigationG.navigate({
              route: NoxRoutes.PlayerHome,
              params: { screen: NoxRoutes.Playlist, pop: true },
            })
          }
        />
        <BottomIconButton
          tint={tint}
          icon={renderIcon(RouteIcons.explore)}
          onPress={() => navigationG.navigate({ route: NoxRoutes.Explore })}
        />
        <BottomIconButton
          tint={tint}
          icon={renderIcon(RouteIcons.setting)}
          onPress={() => navigationG.navigate({ route: NoxRoutes.Settings })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  surface: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  panel: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconSlot: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 52,
    height: 40,
    margin: 0,
    borderRadius: 14,
  },
  activeIconButton: {
    borderRadius: 14,
  },
});

export default NoxBottomTab;
