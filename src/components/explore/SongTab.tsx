import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { chunkArray } from '@utils/Utils';
import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';
import useNavigation from '@hooks/useNavigation';
import { BiliMusicTid } from '@enums/MediaFetch';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { isIOS } from '@utils/RNUtils';

export interface BiliCatSongs {
  [key: number]: NoxMedia.Song[];
}

export interface BiliSongCardProp {
  songs: NoxMedia.Song[];
  title?: string;
  totalSongs?: NoxMedia.Song[];
}

const useTabMetrics = () => {
  const { width } = useWindowDimensions();
  const horizontalPadding = isIOS ? 20 : 5;
  const gap = isIOS ? 12 : 10;
  const cardWidth = isIOS
    ? Math.min(350, Math.max(292, width - horizontalPadding * 2 - 18))
    : width * 0.8;

  return { width, cardWidth, horizontalPadding, gap };
};

export const BiliSongCard = ({
  songs = [],
  title,
  totalSongs,
}: BiliSongCardProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const { playAsSearchList } = usePlayback();
  const { cardWidth } = useTabMetrics();
  const visibleRows = Math.min(4, songs.length);
  const cardHeight = visibleRows * 66 + (title ? 45 : 16);

  return (
    <View
      style={[
        style.cardContainer,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: isIOS
            ? playerStyle.colors.surface
            : 'transparent',
        },
      ]}
    >
      {title && (
        <Text
          style={[style.cardTitle, { color: playerStyle.colors.onSurface }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      <LegendList
        estimatedItemSize={66}
        showsVerticalScrollIndicator={false}
        data={songs}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.72}
            style={style.cardPressable}
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
            <Text
              style={[
                style.rankIndex,
                { color: playerStyle.colors.onSurfaceVariant },
              ]}
            >
              {index + 1}
            </Text>
            <Image
              style={[
                style.cardThumbnail,
                { backgroundColor: playerStyle.colors.surfaceVariant },
              ]}
              source={{ uri: item.cover, width: 52, height: 52 }}
              contentFit="cover"
              transition={isIOS ? 160 : 0}
            />
            <View style={style.songMeta}>
              <Text
                style={[style.songTitle, { color: playerStyle.colors.onSurface }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  style.songArtist,
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

export const BiliSongCatsCard = ({ songs = {} }: { songs?: BiliCatSongs }) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { cardWidth, horizontalPadding, gap } = useTabMetrics();

  return (
    <View style={style.section}>
      <Text
        style={[
          style.sectionTitle,
          {
            color: playerStyle.colors.onBackground,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {t('BiliCategory.ranking')}
      </Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={cardWidth + gap}
        decelerationRate={isIOS ? 'fast' : 'normal'}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, gap }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {Object.keys(songs).map(k => (
          <BiliSongCard
            key={k}
            title={t(`BiliCategory.${k}`)}
            songs={songs[Number(k)]}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const BiliSongsArrayTabCard = ({
  songs = [],
  title,
}: {
  songs?: NoxMedia.Song[];
  title: string;
}) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { cardWidth, horizontalPadding, gap } = useTabMetrics();

  if (songs.length === 0) {
    return <></>;
  }

  const splicedSongs: NoxMedia.Song[][] = chunkArray(songs, 4);

  return (
    <View style={style.section}>
      <Text
        style={[
          style.sectionTitle,
          {
            color: playerStyle.colors.onBackground,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {title}
      </Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={cardWidth + gap}
        decelerationRate={isIOS ? 'fast' : 'normal'}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, gap }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {splicedSongs.map((k, i) => (
          <BiliSongCard
            key={`BiliRankTab${k[0].id ?? i}`}
            songs={k}
            totalSongs={songs}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const BiliSongsTabCard = ({
  songs = {},
  title,
}: {
  songs?: BiliCatSongs;
  title: string;
}) => {
  const concatSongs = BiliMusicTid.reduce(
    (acc, curr) => acc.concat(songs[curr] ?? []),
    [] as NoxMedia.Song[],
  );

  return <BiliSongsArrayTabCard title={title} songs={concatSongs} />;
};

const style = StyleSheet.create({
  section: {
    paddingBottom: 22,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.35,
    paddingBottom: 12,
  },
  cardContainer: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 10,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingBottom: 7,
  },
  cardPressable: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankIndex: {
    width: 24,
    fontSize: 12.5,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  cardThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 9,
  },
  songMeta: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 11,
    paddingRight: 4,
  },
  songTitle: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  songArtist: {
    fontSize: 12.5,
    lineHeight: 17,
    paddingTop: 1,
  },
});
