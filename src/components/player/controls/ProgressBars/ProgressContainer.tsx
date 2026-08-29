import React from 'react';
import { StyleSheet, View } from 'react-native';

import ProgressWavy from './ProgressWavy';
import ProgressBarAPM from './ProgressBar';
import ProgressFetchBar from './ProgressFetchBar';
import NativeProgressBarAPM from './NativeProgressBar';
import NativeProgressFetchBar from './NativeProgressFetchBar';
import MD3NativeProgressBar from './MD3NativeProgressBar';
import { useNoxSetting } from '@stores/useApp';
import { isAndroid, isIOS } from '@utils/RNUtils';
import { ProgressBarContainerProps } from './ProgressBarProps';

const Progress = (p: ProgressBarContainerProps) => (
  <View style={styles.progressContainer}>
    <ProgressBarAPM {...p} />
    <ProgressFetchBar />
  </View>
);

const NativeProgress = (p: ProgressBarContainerProps) => (
  <View
    style={
      isAndroid
        ? styles.progressContainerAndroidNative
        : styles.progressContainerIOS
    }
  >
    <NativeProgressBarAPM {...p} />
    <NativeProgressFetchBar />
  </View>
);

export default function ProgressContainer(p: ProgressBarContainerProps) {
  const playerSetting = useNoxSetting(state => state.playerSetting);

  if (playerSetting.md3slider && playerSetting.nativeBottomTab && isAndroid) {
    return <MD3NativeProgressBar {...p} />;
  }

  // The platform slider has the correct tap-to-seek and gesture behaviour on
  // iPhone, so do not carry the legacy themed/wavy seek bar into the iOS skin.
  if (isIOS) {
    return <NativeProgress {...p} />;
  }

  return (
    <View>
      <ProgressWavy />
      {playerSetting.nativeBottomTab ? (
        <NativeProgress {...p} />
      ) : (
        <Progress {...p} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: -22,
  },
  progressContainerIOS: {
    width: '100%',
    marginTop: -8,
  },
  progressContainerAndroidNative: {
    width: '100%',
    marginTop: -22,
  },
});
