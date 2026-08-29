import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlaybackState } from 'react-native-track-player';

import { PlaybackError } from './PlaybackError';
import { PlayPauseButton } from './PlayPauseButton';
import ThumbsUpButton from './ThumbsUpButton';
import PlayerModeButton from './PlayerModeButton';
import usePlayerControls from './usePlayerControls';
import LottieButton from '@components/buttons/LottieButton';

export const PlayerControls: React.FC = () => {
  const { performSkipToNext, performSkipToPrevious } = usePlayerControls();
  const playback = usePlaybackState();

  return (
    <View style={styles.container}>
      {'error' in playback ? (
        <PlaybackError error={playback.error.message} />
      ) : null}

      <View style={styles.row}>
        <View style={styles.secondaryControl}>
          <PlayerModeButton />
        </View>
        <LottieButton
          src={require('@assets/lottie/skip-backwards.json')}
          size={34}
          onPress={performSkipToPrevious}
          strokes={['Line', 'Triange', 'Triange  2']}
          style={styles.transportButton}
        />
        <PlayPauseButton iconSize={56} />
        <LottieButton
          src={require('@assets/lottie/skip-forwards.json')}
          size={34}
          onPress={performSkipToNext}
          strokes={['Line', 'Triangle 1', 'Triangle 2']}
          style={styles.transportButton}
        />
        <View style={styles.secondaryControl}>
          <ThumbsUpButton />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: 8,
    paddingBottom: 10,
  },
  row: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  transportButton: {
    backgroundColor: undefined,
  },
  secondaryControl: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
