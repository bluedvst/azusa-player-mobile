import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import NoxNativeBottomTab from './NoxNativeBottomTab';
import NoxBottomTab from './NoxBottomTab';
import { isIOS } from '@utils/RNUtils';

export default function BottomTabView({
  navigation,
}: NoxComponent.NavigationProps2) {
  const insets = useSafeAreaInsets();
  const gestureMode = useNoxSetting(state => state.gestureMode);
  const playerSetting = useNoxSetting(state => state.playerSetting);

  if (!(gestureMode || playerSetting.alwaysShowBottomTab)) {
    return <View style={{ height: insets.bottom }} />;
  }

  // iPhone should use the native bottom-tab implementation even when an old
  // migrated preference selected the legacy Material-style bar.
  if (isIOS || playerSetting.nativeBottomTab) {
    return <NoxNativeBottomTab navigation={navigation} />;
  }

  return <NoxBottomTab navigation={navigation} />;
}
