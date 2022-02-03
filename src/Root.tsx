import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import debounce from 'lodash.debounce';
import React, {useEffect, useState} from 'react';
import {Appearance, AppState, AppStateStatus, StatusBar} from 'react-native';
import 'react-native-gesture-handler';
import {ThemeProvider} from 'styled-components/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BottomNotificationModal from './components/modal/bottom-notification/BottomNotification';
import OnGoingProcessModal from './components/modal/ongoing-process/OngoingProcess';
import {baseScreenOptions} from './constants/NavigationOptions';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from './store';
import {AppEffects, AppActions} from './store/app';
import {BitPayDarkTheme, BitPayLightTheme} from './themes/bitpay';
import {LogActions} from './store/log';
import {useDeeplinks} from './utils/hooks';
import analytics from '@segment/analytics-react-native';
import i18n from 'i18next';

import BitpayIdStack, {
  BitpayIdStackParamList,
} from './navigation/bitpay-id/BitpayIdStack';
import CardStack, {CardStackParamList} from './navigation/card/CardStack';
import OnboardingStack, {
  OnboardingStackParamList,
} from './navigation/onboarding/OnboardingStack';
import TabsStack, {TabsStackParamList} from './navigation/tabs/TabsStack';
import WalletStack, {
  WalletStackParamList,
} from './navigation/wallet/WalletStack';
import ScanStack, {ScanStackParamList} from './navigation/scan/ScanStack';
import GeneralSettingsStack, {
  GeneralSettingsStackParamList,
} from './navigation/tabs/settings/general/GeneralStack';
import SecuritySettingsStack, {
  SecuritySettingsStackParamList,
} from './navigation/tabs/settings/security/SecurityStack';
import ContactSettingsStack, {
  ContactSettingsStackParamList,
} from './navigation/tabs/settings/contacts/ContactsStack';
import NotificationSettingsStack, {
  NotificationSettingsStackParamList,
} from './navigation/tabs/settings/notifications/NotificationsStack';
import AboutStack, {
  AboutStackParamList,
} from './navigation/tabs/settings/about/AboutStack';
import AuthStack, {AuthStackParamList} from './navigation/auth/AuthStack';

import BuyCryptoStack, {
  BuyCryptoStackParamList,
} from './navigation/services/buy-crypto/BuyCryptoStack';
import SwapCryptoStack, {
  SwapCryptoStackParamList,
} from './navigation/services/swap-crypto/SwapCryptoStack';
import WalletConnectStack, {
  WalletConnectStackParamList,
} from './navigation/wallet-connect/WalletConnectStack';
import {ShopStackParamList} from './navigation/tabs/shop/ShopStack';
import GiftCardStack, {
  GiftCardStackParamList,
} from './navigation/tabs/shop/gift-card/GiftCardStack';
import DecryptEnterPasswordModal from './navigation/wallet/components/DecryptEnterPasswordModal';

// ROOT NAVIGATION CONFIG
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Tabs: NavigatorScreenParams<TabsStackParamList>;
  BitpayId: NavigatorScreenParams<BitpayIdStackParamList>;
  Wallet: NavigatorScreenParams<WalletStackParamList>;
  Card: NavigatorScreenParams<CardStackParamList>;
  Scan: NavigatorScreenParams<ScanStackParamList>;
  Shop: NavigatorScreenParams<ShopStackParamList>;
  GiftCard: NavigatorScreenParams<GiftCardStackParamList>;
  GeneralSettings: NavigatorScreenParams<GeneralSettingsStackParamList>;
  SecuritySettings: NavigatorScreenParams<SecuritySettingsStackParamList>;
  ContactSettings: NavigatorScreenParams<ContactSettingsStackParamList>;
  NotificationSettings: NavigatorScreenParams<NotificationSettingsStackParamList>;
  About: NavigatorScreenParams<AboutStackParamList>;
  BuyCrypto: NavigatorScreenParams<BuyCryptoStackParamList>;
  SwapCrypto: NavigatorScreenParams<SwapCryptoStackParamList>;
  WalletConnect: NavigatorScreenParams<WalletConnectStackParamList>;
};
// ROOT NAVIGATION CONFIG
export enum RootStacks {
  HOME = 'Home',
  AUTH = 'Auth',
  ONBOARDING = 'Onboarding',
  TABS = 'Tabs',
  BITPAY_ID = 'BitpayId',
  WALLET = 'Wallet',
  CARD = 'Card',
  SCAN = 'Scan',
  GIFT_CARD = 'GiftCard',
  // SETTINGS
  GENERAL_SETTINGS = 'GeneralSettings',
  SECURITY_SETTINGS = 'SecuritySettings',
  CONTACT_SETTINGS = 'ContactSettings',
  NOTIFICATION_SETTINGS = 'NotificationSettings',
  ABOUT = 'About',
  BUY_CRYPTO = 'BuyCrypto',
  SWAP_CRYPTO = 'SwapCrypto',
  WALLET_CONNECT = 'WalletConnect',
}

// ROOT NAVIGATION CONFIG
export type NavScreenParams = NavigatorScreenParams<
  AuthStackParamList &
    OnboardingStackParamList &
    BitpayIdStackParamList &
    WalletStackParamList &
    CardStackParamList &
    GiftCardStackParamList &
    GeneralSettingsStackParamList &
    SecuritySettingsStackParamList &
    ContactSettingsStackParamList &
    NotificationSettingsStackParamList &
    AboutStackParamList &
    BuyCryptoStackParamList &
    SwapCryptoStackParamList &
    ScanStackParamList &
    WalletConnectStackParamList
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const navigate = (
  name: keyof RootStackParamList,
  params: NavScreenParams,
) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

const Root = createStackNavigator<RootStackParamList>();

export default () => {
  const dispatch = useDispatch();
  const [, rerender] = useState({});
  const linking = useDeeplinks();
  const onboardingCompleted = useSelector(
    ({APP}: RootState) => APP.onboardingCompleted,
  );
  const appColorScheme = useSelector(({APP}: RootState) => APP.colorScheme);
  const currentRoute = useSelector(({APP}: RootState) => APP.currentRoute);
  const appLanguage = useSelector(({APP}: RootState) => APP.defaultLanguage);

  // MAIN APP INIT
  useEffect(() => {
    dispatch(AppEffects.startAppInit());
  }, [dispatch]);

  // LANGUAGE
  useEffect(() => {
    if (appLanguage && appLanguage !== i18n.language) {
      i18n.changeLanguage(appLanguage);
    }
  }, [appLanguage]);

  // THEME
  useEffect(() => {
    function onAppStateChange(status: AppStateStatus) {
      // status === 'active' when the app goes from background to foreground,
      // if no app scheme set, rerender in case the system theme has changed
      if (status === 'active' && !appColorScheme) {
        rerender({});
      }
    }

    AppState.addEventListener('change', onAppStateChange);

    return () => AppState.removeEventListener('change', onAppStateChange);
  }, [rerender, appColorScheme]);

  const scheme = appColorScheme || Appearance.getColorScheme();
  const theme = scheme === 'dark' ? BitPayDarkTheme : BitPayLightTheme;
  StatusBar.setBarStyle(
    scheme === 'light' ? 'dark-content' : 'light-content',
    true,
  );

  // ROOT STACKS AND GLOBAL COMPONENTS
  const initialRoute = onboardingCompleted
    ? RootStacks.TABS
    : RootStacks.ONBOARDING;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <NavigationContainer
          ref={navigationRef}
          theme={theme}
          linking={linking}
          onReady={() => {
            // routing to previous route if onboarding
            if (currentRoute && !onboardingCompleted) {
              const [currentStack, params] = currentRoute;
              navigationRef.navigate(currentStack, params);
              dispatch(
                LogActions.info(
                  `Navigating to cached route... ${currentStack} ${JSON.stringify(
                    params,
                  )}`,
                ),
              );
            }
          }}
          onStateChange={debounce(navEvent => {
            // storing current route
            if (navEvent) {
              const {routes} = navEvent;
              let {name, params} = navEvent.routes[routes.length - 1];
              dispatch(AppActions.setCurrentRoute([name, params]));
              dispatch(LogActions.info(`Navigation event... ${name}`));
              if (!__DEV__) {
                if (name === 'Tabs') {
                  const {history} = navEvent.routes[routes.length - 1].state;
                  const tabName = history[history.length - 1].key.split('-')[0];
                  name = `${tabName} Tab`;
                }
                analytics.screen(name, {
                  screen: params?.screen || '',
                });
              }
            }
          }, 300)}>
          <Root.Navigator
            screenOptions={{
              ...baseScreenOptions,
              headerShown: false,
            }}
            initialRouteName={initialRoute}>
            <Root.Screen name={RootStacks.AUTH} component={AuthStack} />
            <Root.Screen
              name={RootStacks.ONBOARDING}
              component={OnboardingStack}
            />
            <Root.Screen
              name={RootStacks.TABS}
              component={TabsStack}
              options={{
                gestureEnabled: false,
              }}
            />
            <Root.Screen
              name={RootStacks.BITPAY_ID}
              component={BitpayIdStack}
            />
            <Root.Screen
              options={{
                gestureEnabled: false,
              }}
              name={RootStacks.WALLET}
              component={WalletStack}
            />
            <Root.Screen name={RootStacks.CARD} component={CardStack} />
            <Root.Screen name={RootStacks.SCAN} component={ScanStack} />
            <Root.Screen
              name={RootStacks.GIFT_CARD}
              component={GiftCardStack}
            />
            {/* SETTINGS */}
            <Root.Screen
              name={RootStacks.GENERAL_SETTINGS}
              component={GeneralSettingsStack}
            />
            <Root.Screen
              name={RootStacks.SECURITY_SETTINGS}
              component={SecuritySettingsStack}
            />
            <Root.Screen
              name={RootStacks.CONTACT_SETTINGS}
              component={ContactSettingsStack}
            />
            <Root.Screen
              name={RootStacks.NOTIFICATION_SETTINGS}
              component={NotificationSettingsStack}
            />
            <Root.Screen name={RootStacks.ABOUT} component={AboutStack} />
            <Root.Screen
              name={RootStacks.BUY_CRYPTO}
              component={BuyCryptoStack}
            />
            <Root.Screen
              name={RootStacks.SWAP_CRYPTO}
              component={SwapCryptoStack}
            />
            <Root.Screen
              name={RootStacks.WALLET_CONNECT}
              component={WalletConnectStack}
            />
          </Root.Navigator>
          <OnGoingProcessModal />
          <BottomNotificationModal />
          <DecryptEnterPasswordModal />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
