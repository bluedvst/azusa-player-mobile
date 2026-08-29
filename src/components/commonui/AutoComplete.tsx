import {
  View,
  GestureResponderEvent,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { Menu, Searchbar } from 'react-native-paper';
import React, { useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { v4 as uuidv4 } from 'uuid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import { styles as stylesGlobal } from '../style';
import { isIOS } from '@utils/RNUtils';

interface Props {
  placeholder: string;
  value: string;
  pressed: React.RefObject<boolean>;
  setValue: (v: string) => void;
  onSubmit: (v: string) => void;
  onIconPress: (e: GestureResponderEvent) => void;
  icon: () => React.ReactNode;
  resolveData?: (v: string) => Promise<string[]>;
  testID?: string;
}

export default function AutoComplete({
  placeholder,
  value,
  setValue,
  onSubmit,
  onIconPress,
  icon,
  resolveData,
  pressed,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const autoCompleteId = useRef('');
  const [debouncedValue] = useDebounce(value, 250);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.Coordinates>({
    x: 0,
    y: 0,
  });

  const onFocus = () => {
    pressed.current = false;
    setShowAutoComplete(true);
  };

  useEffect(() => {
    if (debouncedValue.length < 1) {
      setData([]);
      return;
    }
    if (pressed.current) {
      pressed.current = false;
      return;
    }
    const newId = uuidv4();
    autoCompleteId.current = newId;
    resolveData?.(debouncedValue).then(nextData => {
      if (autoCompleteId.current !== newId) return;
      setData(nextData);
    });
    setShowAutoComplete(true);
  }, [debouncedValue]);

  useEffect(() => {
    const onBackPress = () => {
      if (showAutoComplete) {
        setShowAutoComplete(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [showAutoComplete]);

  const searchSurface =
    playerStyle.colors.elevation?.level2 ??
    playerStyle.colors.surfaceVariant ??
    playerStyle.colors.background;

  return (
    <View style={styles.container}>
      <Searchbar
        testID={testID}
        inputStyle={[
          stylesGlobal.nativeInput,
          isIOS ? styles.inputIOS : undefined,
        ]}
        onLayout={e =>
          setMenuCoords({
            x: e.nativeEvent.layout.x,
            y:
              e.nativeEvent.layout.y + e.nativeEvent.layout.height + insets.top,
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onSubmit(value)}
        style={[
          styles.input,
          isIOS && styles.searchbarIOS,
          { backgroundColor: searchSurface },
        ]}
        elevation={0}
        selectionColor={playerStyle.customColors.textInputSelectionColor}
        onIconPress={onIconPress}
        icon={icon}
        onBlur={() => setShowAutoComplete(false)}
        onFocus={onFocus}
        theme={{
          colors: {
            onSurfaceVariant: playerStyle.colors.onSurfaceVariant,
            onSurface: playerStyle.colors.onSurface,
          },
        }}
      />
      {resolveData && (
        <Menu
          visible={!pressed.current && showAutoComplete}
          onDismiss={() => setShowAutoComplete(false)}
          anchor={menuCoords}
        >
          {data.map(datum => (
            <Menu.Item
              key={datum}
              onPress={() => {
                setValue(datum);
                onSubmit(datum);
                setShowAutoComplete(false);
                pressed.current = true;
              }}
              title={datum}
            />
          ))}
        </Menu>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
  },
  searchbarIOS: {
    height: 44,
    minHeight: 44,
    borderRadius: 14,
  },
  inputIOS: {
    minHeight: 44,
    height: 44,
    fontSize: 16,
    lineHeight: 20,
  },
});
