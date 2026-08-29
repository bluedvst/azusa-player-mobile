import * as React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';

import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';
import { BiliSongCardProp } from './SongTab';
import useNavigation from '@hooks/useNavigation';
import { YTSongRowCard, YTSongRowProp } from './types';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { isIOS } from '@utils/RNUtils';

const useCarouselMetrics = () => {
  const { width } = useWindowDimensions();
  const horizontalPadding = isIOS ? 20 : 5;
  const gap = isIOS ? 12 : 10;
  const cardWidth = isIOS
    ? Math.min(160, Math.max(136, (width - horizontalPadding * 2 - gap) / 2.25))
    : 140;

  return { cardWidth, horizontalPadding, gap };
};

export const BiliSongRow = ({
  songs = [],
  title,
  totalSongs,
}: BiliSongCardProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const { playAsSearchList } = usePlayback();
  const { cardWidth, horizontalPadding, gap } = useCarouselMetrics();

  return (
    <View style={styles.section}>
      {title && (
        <Text
          style={[
            styles.sectionTitle,
            { color: playerStyle.colors.onBackground, paddingHorizontal: horizontalPadding },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={songs}
        horizontal
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, gap }}
        keyExtractor={(item, index) => `${item.id ?? item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.78}
            style={{ width: cardWidth }}
            onPress={() => {
              navigationGlobal.navigate({
                route: NoxRoutes.PlayerHome,
                params: { screen: NoxRoutes.Playlist, pop: true },
              });
              playAsSearchList({
                songs: totalSongs ?? songs,
                song: item,
              }).then(() => setTimeout(scroll, 500));
            }}
          >
            <Image
              style={[
                styles.albumImage,
                {
                  width: cardWidth,
                  height: cardWidth,
                  backgroundColor: playerStyle.colors.surfaceVariant,
                },
              ]}
              source={{ uri: item.cover, width: cardWidth, height: cardWidth }}
              contentFit="cover"
              transition={isIOS ? 180 : 0}
            />
            <View style={styles.meta}>
              <Text
                style={[styles.title, { color: playerStyle.colors.onBackground }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: playerStyle.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {item.singer}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// TODO: abstract as a parent class to above
export const YTSongRow = ({ playlists = [], title }: YTSongRowProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter,
  );
  const { playAsSearchList } = usePlayback();
  const { cardWidth, horizontalPadding, gap } = useCarouselMetrics();

  const onPress = async (item: YTSongRowCard) => {
    navigationGlobal.navigate({
      route: NoxRoutes.PlayerHome,
      params: { screen: NoxRoutes.Playlist, pop: true },
    });
    progressEmitter(100);
    const playlist = await item.getPlaylist(progressEmitter);
    playAsSearchList({
      songs: playlist.songs,
      song: playlist.item,
    }).then(() => {
      progressEmitter(0);
      setTimeout(scroll, 500);
    });
  };

  return (
    <View style={styles.section}>
      {title && (
        <Text
          style={[
            styles.sectionTitle,
            { color: playerStyle.colors.onBackground, paddingHorizontal: horizontalPadding },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={playlists}
        horizontal
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, gap }}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.78}
            style={{ width: cardWidth }}
            onPress={() => onPress(item)}
          >
            <Image
              style={[
                styles.albumImage,
                {
                  width: cardWidth,
                  height: cardWidth,
                  backgroundColor: playerStyle.colors.surfaceVariant,
                },
              ]}
              source={{ uri: item.cover, width: cardWidth, height: cardWidth }}
              contentFit="cover"
              transition={isIOS ? 180 : 0}
            />
            <View style={styles.meta}>
              <Text
                style={[styles.title, { color: playerStyle.colors.onBackground }]}
                numberOfLines={item.singer ? 1 : 2}
              >
                {item.name}
              </Text>
              {item.singer && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: playerStyle.colors.onSurfaceVariant },
                  ]}
                  numberOfLines={1}
                >
                  {item.singer}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingBottom: 22,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.35,
    paddingBottom: 12,
  },
  albumImage: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  meta: {
    paddingTop: 9,
    paddingHorizontal: 1,
    minHeight: 52,
  },
  title: {
    fontSize: 14.5,
    lineHeight: 18.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    paddingTop: 2,
  },
});
