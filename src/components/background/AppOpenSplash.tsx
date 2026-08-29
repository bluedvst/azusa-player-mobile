import React from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAlert from '../dialogs/useAlert';
import { clearStorage } from '@utils/ChromeStorageAPI';

enum SplashType {
  Image = 'image',
}

type SplashArray = [SplashType, () => unknown][];

/** Local artwork retained for the appearance preview screen. No remote splash
 * content or promotional video is requested during application startup. */
export const imageSplashes: SplashArray = [
  [SplashType.Image, () => require('@assets/splash/steria2.jpg')],
  [SplashType.Image, () => require('@assets/splash/nox-3d.jpg')],
  [SplashType.Image, () => require('@assets/splash/nox-3d-2024.jpg')],
];

interface Props {
  setIsSplashReady: (v: boolean) => void;
}

const AppOpenSplash = ({ setIsSplashReady }: Props) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    setIsSplashReady(true);
  }, [setIsSplashReady]);

  return (
    <Image
      source={imageSplashes[0][1]() as number}
      style={{
        width,
        height: height + insets.top + insets.bottom,
      }}
      contentFit="contain"
    />
  );
};

export default function AppOpenSplashView(p: Props) {
  const pressingCount = React.useRef(0);
  const { TwoWayAlert } = useAlert();

  return (
    <Pressable
      onPress={() => {
        pressingCount.current++;
        if (pressingCount.current > 5) {
          TwoWayAlert('Reset', 'Are you sure to reset the app?', clearStorage);
        }
      }}
    >
      <AppOpenSplash {...p} />
    </Pressable>
  );
}
