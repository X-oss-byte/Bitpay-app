import React, {useEffect, useState} from 'react';
import {AppActions} from '../../../store/app';
import {ModalId} from '../../../store/app/app.reducer';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {View, Pressable} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {Black, White} from '../../../styles/colors';

type ModalProps = {
  id: ModalId;
  isVisible: boolean;
  onModalHide?: () => void;
  onModalWillShow?: () => void;
  onBackdropPress?: () => void;
  children: React.ReactNode;
  placement: 'top' | 'bottom' | undefined;
  fullScreen?: boolean;
};

const BaseModal: React.FC<ModalProps> = props => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const activeModalId = useAppSelector(({APP}) => APP.activeModalId);
  const [isVisibleSafe, setVisibleSafe] = useState(false);
  const {id, isVisible, onModalHide, onModalWillShow, placement, fullScreen} =
    props as ModalProps;

  useEffect(() => {
    if (isVisible) {
      if (!activeModalId || activeModalId === id) {
        setVisibleSafe(true);
        dispatch(AppActions.activeModalUpdated(id));
        onModalWillShow?.();
      } else {
        setVisibleSafe(false);
        dispatch(AppActions.activeModalUpdated(null));
        onModalHide?.();
      }
    } else {
      setVisibleSafe(false);
      dispatch(AppActions.activeModalUpdated(null));
      onModalHide?.();
    }
  }, [activeModalId, id, isVisible]);
  return isVisibleSafe ? (
    <>
      {!fullScreen ? (
        <Pressable
          style={{
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
      ) : null}
      <View
        style={{
          position: 'absolute',
          top: placement === 'top' ? 0 : undefined,
          bottom: placement === 'bottom' ? 0 : undefined,
          width: '100%',
          left: fullScreen ? 0 : undefined,
          zIndex: isVisibleSafe ? 1000000 : undefined,
        }}>
        {props.children}
      </View>
    </>
  ) : null;
};

export default BaseModal;
