import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';

export const baseNavigatorOptions: StackNavigationOptions = {
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerShadowVisible: false,
};

export const baseScreenOptions: StackNavigationOptions = {
  ...TransitionPresets.DefaultTransition,
};
