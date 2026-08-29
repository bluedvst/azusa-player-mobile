import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { NoxRoutes } from '@enums/Routes';
import Explore from '../explore/View';
import LandscapeLyricView from './LandscapeLyric';
import { SettingsLandscape as Settings } from '../setting/View';
import Playlist from '../playlist/View';
import { Playlists } from '../playlists/Playlists';
import DefaultScreenOption from '@enums/ScreenOption';
import { useNoxSetting } from '@stores/useApp';
import { isIOS } from '@utils/RNUtils';

const Stack = createNativeStackNavigator();

interface Props {
  panelWidth: number;
}

export default function LandscapePlaylistPanel({ panelWidth }: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const panelStyle = {
    flex: 1,
    width: panelWidth,
  };

  return (
    <View
      style={[
        styles.container,
        panelStyle,
        {
          backgroundColor: playerStyle.colors.background,
          borderLeftColor: playerStyle.colors.outlineVariant,
          borderLeftWidth: isIOS ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: playerStyle.colors.background },
          ...DefaultScreenOption,
        }}
      >
        <Stack.Screen name={NoxRoutes.Lyrics}>
          {() => <LandscapeLyricView panelStyle={panelStyle} />}
        </Stack.Screen>
        <Stack.Screen name={NoxRoutes.Playlist} component={Playlist} />
        <Stack.Screen
          name={NoxRoutes.PlaylistsDrawer}
          component={Playlists}
        />
        <Stack.Screen name={NoxRoutes.Explore} component={Explore} />
        <Stack.Screen name={NoxRoutes.Settings} component={Settings} />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 0,
    overflow: 'hidden',
  },
});
