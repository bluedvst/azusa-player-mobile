import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Linking, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from 'zustand';
import * as Sentry from '@sentry/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

import useSetupPlayer from './hooks/useSetupPlayer';
import { useIsLandscape } from './hooks/useOrientation';
import appStore from '@stores/appStore';
import MainBackground from './components/background/MainBackground';
import useTheme from './hooks/useTheme';
// eslint-disable-next-line import/no-unresolved
import { TRACKING } from '@env';
import { useSetupVIP } from './hooks/useVIP';
import SongMenuSheet from '@components/songmenu/SongMenuSheet';
import { useNoxSetting } from '@stores/useApp';
import SnackBar from './components/commonui/Snackbar';
import APM from './components/APM';
import {
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from './components/styles/Theme';
import APMContext from './contexts/APMContext';
import HookEmptyComponent from './HookEmptyComponent';

if (TRACKING) {
  Sentry.init({
    dsn: 'https://2662633cce5b4b9f99da6b395b0a471f@o4505087864799232.ingest.us.sentry.io/4505087866044416',
    tracesSampleRate: 0,
    ignoreErrors: [
      'Network request failed',
      'Download interrupted.',
      /Failed to delete /,
      'Cannot convert undefined value to object',
      'no audio url',
      'com.google.android.play.core.appupdate.internal.zzy',
      'TEST - Sentry Client Crash',
      /MuseError/,
    ],
  });
}

export default function App(appProps: NoxComponent.AppProps) {
  const { vip } = useSetupVIP();
  const isPlayerReady = useSetupPlayer({ ...appProps, vip });
  const isLandscape = useIsLandscape();
  const PIPMode = useStore(appStore, state => state.pipMode);
  const setInitialURL = useNoxSetting(state => state.setInitialURL);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usedTheme = useTheme();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const defaultTheme = playerStyle.metaData.darkTheme
    ? CombinedDarkTheme
    : CombinedDefaultTheme;
  const defaultNavTheme = playerStyle.metaData.darkTheme
    ? NavigationDarkTheme
    : NavigationDefaultTheme;

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      console.log('deepLinkHandler', data.url);
    }

    const subscription = Linking.addEventListener('url', deepLinkHandler);
    Linking.getInitialURL().then(url => url && setInitialURL(url));
    return () => subscription.remove();
  }, [setInitialURL]);

  // The former splash component could randomly start a remote promotional video and
  // imposed an artificial delay on every cold launch. iPhone builds now transition
  // directly into the app as soon as the audio engine is ready.
  if (!isPlayerReady) {
    return (
      <SafeAreaProvider>
        <View
          style={[
            styles.launchContainer,
            { backgroundColor: playerStyle.colors.background },
          ]}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <HookEmptyComponent />
      <SafeAreaProvider>
        <APMContext>
          <MainBackground />
          <View
            style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}
          >
            <PaperProvider
              theme={{
                ...defaultTheme,
                colors: playerStyle.colors,
              }}
            >
              <APM
                PIP={PIPMode}
                isLandscape={isLandscape}
                defaultNavTheme={defaultNavTheme}
                defaultTheme={defaultTheme}
              />
              <SongMenuSheet />
              <SnackBar />
            </PaperProvider>
          </View>
        </APMContext>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  launchContainer: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
});
