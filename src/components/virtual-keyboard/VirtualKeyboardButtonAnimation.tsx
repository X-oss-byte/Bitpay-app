import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';
import {VIRTUAL_KEYBOARD_BUTTON_SIZE} from './VirtualKeyboard';
import styled from 'styled-components/native';

interface RippleProps {
  onPress: () => void;
  backgroundColor?: string;
  onLongPress?: () => void;
  children: React.ReactNode;
}

const PressableButton = styled.Pressable`
  cursor: pointer;
`;

const VirtualKeyboardButtonAnimation: React.FC<RippleProps> = ({
  onPress,
  backgroundColor,
  onLongPress,
  children,
}) => {
  onLongPress = onLongPress || onPress;

  const startedAnimationValue = new Animated.Value(0);
  const [animate, setAnimate] = useState(startedAnimationValue);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (pressed) {
      Animated.spring(animate, {
        toValue: 5,
        speed: 5000,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(animate, {
          toValue: 0,
          speed: 100,
          useNativeDriver: true,
        }).start(() => {
          setAnimate(startedAnimationValue);
        });
        setPressed(false);
      });
    }
  }, [pressed]);

  return (
    <PressableButton
      style={{
        overflow: 'hidden',
        height: VIRTUAL_KEYBOARD_BUTTON_SIZE - 5,
        width: VIRTUAL_KEYBOARD_BUTTON_SIZE - 5,
        marginHorizontal: 5,
        marginVertical: 5,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor || 'transparent',
      }}
      onLongPress={onLongPress}
      onPress={() => {
        setPressed(true);
        onPress();
      }}>
      <Animated.View
        style={{
          transform: [{translateY: animate}],
        }}>
        {children}
      </Animated.View>
    </PressableButton>
  );
};

export default VirtualKeyboardButtonAnimation;
