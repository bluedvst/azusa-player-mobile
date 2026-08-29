import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { useRef, useState } from 'react';
import { IconButton } from 'react-native-paper';

import { Site, Sites, SiteIcon } from '@enums/Network';
import useCollapsable from './useCollapsable';
import { Collapsable } from '@components/commonui/Collapsable';
import { isIOS } from '@utils/RNUtils';
import { useNoxSetting } from '@stores/useApp';

interface Props {
  LoginComponent: (p: { loginSite: Site }) => JSX.Element;
  iconSize?: number;
  iconTabStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onSiteChange?: (site: Site) => void;
  defaultSite?: Site;
  sites?: Site[];
}

export default function SiteSelector({
  defaultSite = Site.Bilibili,
  LoginComponent,
  iconSize = 40,
  iconTabStyle = styles.iconTab,
  containerStyle = styles.container,
  onSiteChange,
  sites = Sites,
}: Props) {
  const [loginSite, setLoginSite] = useState<Site>(defaultSite);
  const collapsed = useCollapsable(state => state.collapse);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const opacityValue = (v: Site, toSite = loginSite) =>
    toSite === v ? 1 : isIOS ? 0.58 : 0.2;

  const bilibiliOpacity = useRef(
    new Animated.Value(opacityValue(Site.Bilibili)),
  ).current;
  const ytmOpacity = useRef(new Animated.Value(opacityValue(Site.YTM))).current;
  const ytmChartOpacity = useRef(
    new Animated.Value(opacityValue(Site.YTMChart)),
  ).current;

  const getAnimatedOpacityRef = (site: Site) => {
    switch (site) {
      case Site.Bilibili:
        return bilibiliOpacity;
      case Site.YTM:
        return ytmOpacity;
      case Site.YTMChart:
        return ytmChartOpacity;
    }
  };

  const setLoginSiteAnimated = (v: Site) => {
    setLoginSite(v);
    onSiteChange?.(v);
    Animated.parallel(
      sites.map(site =>
        Animated.timing(getAnimatedOpacityRef(site), {
          toValue: opacityValue(site, v),
          duration: 180,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  const usedIconSize = isIOS ? Math.min(iconSize, 24) : iconSize;

  return (
    <View style={containerStyle}>
      <Collapsable collapsed={collapsed}>
        <View
          style={[
            iconTabStyle,
            isIOS && styles.iconTabIOS,
            isIOS && {
              backgroundColor:
                playerStyle.colors.elevation?.level2 ??
                playerStyle.colors.surfaceVariant,
            },
          ]}
        >
          {sites.map(site => (
            <IconButton
              key={site}
              style={[
                styles.iconButton,
                { opacity: getAnimatedOpacityRef(site) },
              ]}
              mode={isIOS && loginSite === site ? 'contained-tonal' : undefined}
              icon={SiteIcon(site, usedIconSize)}
              size={usedIconSize}
              onPress={() => setLoginSiteAnimated(site)}
            />
          ))}
        </View>
      </Collapsable>
      <LoginComponent loginSite={loginSite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconTab: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconTabIOS: {
    alignSelf: 'center',
    minHeight: 44,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 15,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 40,
    marginHorizontal: 2,
    marginVertical: 0,
    borderRadius: 12,
  },
});
