import React, {useEffect, useState} from 'react';
import {AppActions} from '../../../store/app';
import {ModalId} from '../../../store/app/app.reducer';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {useTheme} from '@react-navigation/native';
import {Black, OledBlack, White} from '../../../styles/colors';
import {Easing, Animated, Pressable, View} from 'react-native-macos';

type ModalProps = {
  id: ModalId;
  isVisible: boolean;
  onModalHide?: () => void;
  onModalWillShow?: () => void;
  onBackdropPress?: () => void;
  children: React.ReactNode;
  placement: 'top' | 'bottom' | 'center' | undefined;
  fullScreen?: boolean;
  useMaxHeight?: string;
};

const BaseModal: React.FC<ModalProps> = props => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const activeModalId = useAppSelector(({APP}) => APP.activeModalId);
  const [isVisibleSafe, setVisibleSafe] = useState(false);
  const {
    id,
    isVisible,
    onModalHide,
    onModalWillShow,
    placement,
    fullScreen,
    useMaxHeight,
  } = props as ModalProps;

  const startedAnimationValue = new Animated.Value(
    placement === 'top' ? -10 : 10,
  );
  const [animate, setAnimate] = useState(startedAnimationValue); // Initial value for scale: 0

  useEffect(() => {
    if (isVisible) {
      if (!activeModalId || activeModalId === id) {
        if (placement === 'top' || placement === 'bottom') {
          Animated.spring(animate, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
        setVisibleSafe(true);
        dispatch(AppActions.activeModalUpdated(id));
        onModalWillShow?.();
      } else {
        setAnimate(startedAnimationValue);
        setVisibleSafe(false);
        dispatch(AppActions.activeModalUpdated(null));
        onModalHide?.();
      }
    } else {
      setAnimate(startedAnimationValue);
      setVisibleSafe(false);
      dispatch(AppActions.activeModalUpdated(null));
      onModalHide?.();
    }
  }, [activeModalId, id, isVisible]);
  return isVisibleSafe ? (
    <>
      <Pressable
        style={{
          display: fullScreen ? 'none' : undefined,
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          opacity: 0.3,
          zIndex: 1,
          backgroundColor: theme.dark ? White : Black,
        }}
        onPress={props.onBackdropPress}>
        <View />
      </Pressable>
      <Animated.View
        style={{
          transform: fullScreen
            ? undefined
            : placement === 'top'
            ? [{translateY: animate}]
            : [{translateY: animate}],
          position: 'absolute',
          top: placement === 'top' || fullScreen ? 0 : undefined,
          bottom: placement === 'bottom' ? 0 : undefined,
          width: '100%',
          left: fullScreen ? 0 : undefined,
          height: fullScreen ? '100%' : undefined,
          zIndex: 1000000,
          backgroundColor: fullScreen
            ? theme.dark
              ? OledBlack
              : White
            : undefined,
          maxHeight: useMaxHeight ? useMaxHeight : undefined,
        }}>
        {props.children}
      </Animated.View>
    </>
  ) : null;
};

export default BaseModal;
