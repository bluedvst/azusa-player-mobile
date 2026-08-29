import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useStore } from 'zustand';

import { useNoxSetting } from '@stores/useApp';
import NoxPlayingList from '@stores/playingList';
import SongMenuButton from '@components/player/TrackInfo/SongMenuButton';
import FavReloadButton from '@components/player/TrackInfo/FavReloadButton';
import { useTrackStore } from '@hooks/useActiveTrack';
import { SongTitle } from '@components/player/TrackInfo/TrackInfoTemplate';
import ArtistText from './ArtistText';
import { NativeText as Text } from '@components/commonui/ScaledText';

interface Props extends NoxComponent.OpacityProps {
  artworkOpacity: SharedValue<number>;
}

export default function MiniplayerTrackInfo({
  opacity,
  style,
  artworkOpacity,
}: Props) {
  const track = useTrackStore(s => s.track);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingIndex = useStore(
    NoxPlayingList,
    state => state.currentPlayingIndex,
  );

  const playlistSongIndex = track?.song
    ? currentPlayingList.songList.findIndex(song => song.id === track.song.id) + 1
    : 0;
  const queuePosition = currentPlayingIndex + 1;
  const queueLength = currentPlayingList.songList.length;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const animatedArtworkStyle = useAnimatedStyle(() => ({
    opacity: artworkOpacity.value,
  }));

  return (
    <Animated.View
      style={[mStyles.container, style, animatedStyle, animatedArtworkStyle]}
    >
      <View style={mStyles.primaryRow}>
        <View style={mStyles.textColumn}>
          <SongTitle
            style={[
              mStyles.title,
              { color: playerStyle.colors.onSurface },
            ]}
            text={track?.title}
            bouncePadding={BouncePadding}
          />
          <ArtistText
            track={track}
            style={[
              mStyles.artist,
              { color: playerStyle.colors.onSurfaceVariant },
            ]}
          />
        </View>
        <View style={mStyles.actionButton}>
          <FavReloadButton track={track} />
        </View>
        <View style={mStyles.actionButton}>
          <SongMenuButton track={track} />
        </View>
      </View>
      <Text
        numberOfLines={1}
        style={[
          mStyles.queueText,
          { color: playerStyle.colors.onSurfaceVariant },
        ]}
      >
        {currentPlayingList.title}
        {queueLength > 0
          ? `  ·  ${playlistSongIndex || queuePosition}/${queueLength}`
          : ''}
      </Text>
    </Animated.View>
  );
}

const BouncePadding = { left: 0, right: 8 };

const mStyles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  primaryRow: {
    width: '100%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: 8,
  },
  title: {
    width: '100%',
    height: 30,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.35,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  artist: {
    width: '100%',
    height: 23,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'left',
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueText: {
    width: '100%',
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
