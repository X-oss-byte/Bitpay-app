import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {VIRTUAL_KEYBOARD_BUTTON_SIZE} from './VirtualKeyboard';

interface RippleProps {
  onPress: () => void;
  backgroundColor?: string;
  onLongPress?: () => void;
  children: React.ReactNode;
}

const VirtualKeyboardButtonAnimation: React.FC<RippleProps> = ({
  onPress,
  backgroundColor,
  onLongPress,
  children,
}) => {
  onLongPress = onLongPress || onPress;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        {
          overflow: 'hidden',
          height: VIRTUAL_KEYBOARD_BUTTON_SIZE,
          width: VIRTUAL_KEYBOARD_BUTTON_SIZE,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={onPress}>
      <View>{children}</View>
    </TouchableOpacity>
  );
};

export default VirtualKeyboardButtonAnimation;
