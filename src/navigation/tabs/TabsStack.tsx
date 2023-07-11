import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigatorScreenParams, useTheme} from '@react-navigation/native';
import {TouchableOpacity, View} from 'react-native';

import HomeRoot from './home/HomeStack';
import TransactModal from '../../components/modal/transact-menu/TransactMenu';
import SettingsRoot from './settings/SettingsStack';
import {SettingsStackParamList} from './settings/SettingsStack';

import {SvgProps} from 'react-native-svg';
import HomeIcon from '../../../assets/img/tab-icons/home.svg';
import HomeFocusedIcon from '../../../assets/img/tab-icons/home-focused.svg';
import TransactButtonIcon from '../../../assets/img/tab-icons/transact-button.svg';
import SettingsIcon from '../../../assets/img/tab-icons/settings.svg';
import SettingsFocusedIcon from '../../../assets/img/tab-icons/settings-focused.svg';
import styled from 'styled-components/native';
import {useAppDispatch} from '../../utils/hooks';
import {showTransactMenu} from '../../store/app/app.actions';

const Icons: Record<string, React.FC<SvgProps>> = {
  Home: HomeIcon,
  HomeFocused: HomeFocusedIcon,
  TransactButton: TransactButtonIcon,
  Settings: SettingsIcon,
  SettingsFocused: SettingsFocusedIcon,
};

export enum TabsScreens {
  HOME = 'Home',
  TRANSACT_BUTTON = 'TransactButton',
  SETTINGS = 'Settings',
}

export type TabsStackParamList = {
  Home: undefined;
  TransactButton: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

const TransactButton = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const Tab = createBottomTabNavigator<TabsStackParamList>();

const TabsStack = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onPressTransactMenu = () => {
    dispatch(showTransactMenu());
  };
  const TransactionButton = () => {
    return (
      <>
        <TransactButton>
          <TouchableOpacity onPress={onPressTransactMenu}>
            <TransactButtonIcon />
          </TouchableOpacity>
        </TransactButton>
      </>
    );
  };
  return (
    <Tab.Navigator
      initialRouteName={TabsScreens.HOME}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          minHeight: 58,
        },
        tabBarItemStyle: {
          minHeight: 58,
          cursor: 'pointer',
        },
        tabBarShowLabel: false,
        lazy: false,
        tabBarIcon: ({focused}) => {
          let {name: icon} = route;

          if (focused) {
            icon += 'Focused';
          }
          const Icon = Icons[icon];

          return <Icon />;
        },
      })}>
      <Tab.Screen name={TabsScreens.HOME} component={HomeRoot} />
      <Tab.Screen
        name={TabsScreens.TRANSACT_BUTTON}
        component={TransactionButton}
        options={{
          tabBarIcon: () => <TransactionButton />,
        }}
      />
      <Tab.Screen name={TabsScreens.SETTINGS} component={SettingsRoot} />
    </Tab.Navigator>
  );
};

export default TabsStack;
