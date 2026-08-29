import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';
import { PaperListItem } from '@components/commonui/ScaledText';
import { isIOS } from '@utils/RNUtils';

interface Props {
  icon?: string | (() => React.JSX.Element);
  settingName: string;
  onPress: () => void;
  settingCategory?: string;
  modifyDescription?: (val: string) => string;
}

const SettingListItem = ({
  icon,
  settingName,
  onPress,
  settingCategory = 'DeveloperSettings',
  modifyDescription = (val: string) => val,
}: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const getIcon = () => {
    if (typeof icon === 'string') {
      return (
        <View
          style={[
            styles.iconTile,
            {
              backgroundColor:
                playerStyle.colors.secondaryContainer ??
                playerStyle.colors.elevation?.level2,
            },
          ]}
        >
          <IconButton
            iconColor={playerStyle.colors.primary}
            icon={icon}
            size={isIOS ? 20 : 28}
            style={styles.icon}
          />
        </View>
      );
    }
    if (typeof icon === 'function') return icon();
    return <></>;
  };

  return (
    <PaperListItem
      left={getIcon}
      right={
        isIOS
          ? () => (
              <IconButton
                icon="chevron-right"
                iconColor={playerStyle.colors.onSurfaceVariant}
                size={20}
                style={styles.chevron}
              />
            )
          : undefined
      }
      title={t(`${settingCategory}.${settingName}Name`)}
      description={modifyDescription(
        t(`${settingCategory}.${settingName}Desc`),
      )}
      titleStyle={isIOS ? styles.titleIOS : undefined}
      descriptionStyle={isIOS ? styles.descriptionIOS : undefined}
      onPress={onPress}
      style={[
        styles.listItem,
        isIOS && styles.listItemIOS,
        isIOS && {
          backgroundColor:
            playerStyle.colors.elevation?.level1 ?? playerStyle.colors.surface,
        },
      ]}
    />
  );
};

export default SettingListItem;

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 0,
  },
  listItemIOS: {
    minHeight: 66,
    marginHorizontal: 16,
    marginVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    margin: 0,
  },
  chevron: {
    width: 32,
    height: 44,
    margin: 0,
    alignSelf: 'center',
  },
  titleIOS: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  descriptionIOS: {
    marginTop: 1,
    fontSize: 12.5,
    lineHeight: 16,
  },
});
