import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';

export const baseNavigatorOptions: StackNavigationOptions = {
  headerTitle: '',
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerShadowVisible: false,
};

export const baseScreenOptions: StackNavigationOptions = {
  ...TransitionPresets.DefaultTransition,
};
