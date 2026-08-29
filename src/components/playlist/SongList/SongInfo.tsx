import * as React from 'react';
import { Checkbox } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import Animated, {
  DerivedValue,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import inRange from 'lodash/inRange';
import throttle from 'lodash/throttle';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { scheduleOnRN } from 'react-native-worklets';
import { Pressable, RectButton } from 'react-native-gesture-handler';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
import { seconds2MMSS } from '@utils/Utils';
import { PlaylistTypes } from '@enums/Playlist';
import NoxCache from '@utils/Cache';
import { UsePlaylistRN } from '../usePlaylistRN';
import { getArtistName } from '@objects/Song';
import { NoxSheetRoutes } from '@enums/Routes';
import { IconButton } from '@components/commonui/RNGHPaperWrapper';

interface AnimatedCheckedOpacityProps extends React.PropsWithChildren {
  checked: boolean;
  checking: boolean;
}

const AnimatedCheckedOpacity = ({
  checked,
  checking,
  children,
}: AnimatedCheckedOpacityProps) => {
  const selectedOpacity = useSharedValue(0);
  const selectedOpacityAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(25, 25, 25, ${Math.round(selectedOpacity.value * 100) / 100})`,
  }));

  React.useEffect(() => {
    if (checking) {
      selectedOpacity.value = withTiming(checked ? 0.28 : 0, { duration: 160 });
    } else {
      selectedOpacity.value = withTiming(0, { duration: 160 });
    }
  }, [checked, checking]);

  return (
    <Animated.View style={selectedOpacityAnimatedStyle}>
      {children}
    </Animated.View>
  );
};

interface Props {
  item: NoxMedia.Song;
  index: number;
  currentPlaying: boolean;
  usePlaylist: UsePlaylistRN;
  onLongPress?: () => void;
  onChecked?: () => void;
  networkCellular?: boolean;
  cursorOffset: DerivedValue<number>;
  getLayoutY: (index: number) => number;
  dragToSelect: SharedValue<number>;
  testID?: string;
}

const isItemSolid = (
  item: NoxMedia.Song,
  networkCellular = false,
  dataSaver = false,
) => {
  if (item.liveStatus !== undefined) return item.liveStatus;
  if (!networkCellular) return true;
  if (dataSaver && !NoxCache.noxMediaCache?.peekCache(item)) return false;
  return true;
};

const SongInfo = ({
  item,
  index,
  currentPlaying,
  usePlaylist,
  onLongPress = () => undefined,
  onChecked = () => undefined,
  networkCellular = false,
  getLayoutY,
  cursorOffset,
  dragToSelect,
  testID,
}: Props) => {
  const { playSong, checking, selected } = usePlaylist;
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes,
  );

  const title =
    playerSetting.parseSongName && currentPlaylist.type !== PlaylistTypes.Search
      ? item.parsedName
      : item.name;
  const id = item.id;
  const [, setChecked] = React.useState(false);

  const toggleCheck = React.useMemo(
    () =>
      throttle(() => {
        onChecked();
        setChecked(val => !val);
      }, 100),
    [onChecked, setChecked],
  );

  const dragToggleCheck = (min: number, max: number) => {
    if (inRange(getLayoutY(index), min, max)) toggleCheck();
  };

  useAnimatedReaction(
    () => cursorOffset.value,
    (c, p) => {
      if (dragToSelect.value === 0 || p === null) return;
      scheduleOnRN(dragToggleCheck, c, p);
    },
  );

  const getSongIndex = () =>
    currentPlaylist.songList.findIndex(song => song.id === id);
  const checked = selected[getSongIndex()];

  const activeBackground =
    playerStyle.colors.secondaryContainer ?? 'rgba(103, 80, 164, 0.16)';

  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        { backgroundColor: currentPlaying ? activeBackground : 'transparent' },
        {
          opacity: isItemSolid(item, networkCellular, playerSetting.dataSaver)
            ? 1
            : 0.5,
        },
      ]}
    >
      <AnimatedCheckedOpacity checked={checked} checking={checking}>
        <RectButton
          style={styles.container}
          onLongPress={checking ? toggleCheck : onLongPress}
          onPress={checking ? toggleCheck : () => playSong(item)}
        >
          {checking ? (
            <View style={styles.checkBox}>
              <Pressable onPress={toggleCheck}>
                <Checkbox
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => {}}
                />
              </Pressable>
            </View>
          ) : (
            <Text
              style={[
                styles.index,
                {
                  color: currentPlaying
                    ? playerStyle.colors.primary
                    : playerStyle.colors.onSurfaceVariant,
                },
              ]}
              numberOfLines={1}
            >
              {index + 1}
            </Text>
          )}

          <View style={styles.songText}>
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: currentPlaying
                    ? playerStyle.colors.primary
                    : playerStyle.colors.onSurface,
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.artist,
                { color: playerStyle.colors.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              {getArtistName(item)}
            </Text>
          </View>

          <Text
            style={[
              styles.time,
              { color: playerStyle.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {seconds2MMSS(item.duration)}
          </Text>
          <IconButton
            icon="dots-horizontal"
            size={20}
            style={styles.menuButton}
            onPress={() => {
              setSongMenuSongIndexes([getSongIndex()]);
              TrueSheet.present(NoxSheetRoutes.SongsMenuInListSheet);
            }}
          />
        </RectButton>
      </AnimatedCheckedOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 12,
    marginVertical: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  container: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 2,
    paddingVertical: 6,
  },
  index: {
    width: 32,
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  checkBox: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingLeft: 4,
    paddingRight: 8,
  },
  title: {
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  artist: {
    marginTop: 2,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400',
  },
  time: {
    minWidth: 42,
    textAlign: 'right',
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  menuButton: {
    width: 40,
    height: 44,
    margin: 0,
  },
});

export default SongInfo;
