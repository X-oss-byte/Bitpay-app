import React from 'react';
import {View} from 'react-native-macos';
import {VIRTUAL_KEYBOARD_BUTTON_SIZE} from './VirtualKeyboard';
import styled from 'styled-components/native';

interface RippleProps {
  onPress: () => void;
  backgroundColor?: string;
  onLongPress?: () => void;
  children: React.ReactNode;
}

const TouchableButton = styled.TouchableOpacity`
  cursor: pointer;
`;

const VirtualKeyboardButtonAnimation: React.FC<RippleProps> = ({
  onPress,
  backgroundColor,
  onLongPress,
  children,
}) => {
  onLongPress = onLongPress || onPress;

  return (
    <TouchableButton
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
    </TouchableButton>
  );
};

export default VirtualKeyboardButtonAnimation;
