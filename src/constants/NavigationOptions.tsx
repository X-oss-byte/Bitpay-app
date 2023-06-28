import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';
import Back from '../components/back/Back';

export const baseNavigatorOptions: StackNavigationOptions = {
  headerBackImage: () => <Back opacity={1} />,
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
