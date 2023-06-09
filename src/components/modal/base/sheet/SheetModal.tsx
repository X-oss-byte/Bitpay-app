import React from 'react';
import {SheetParams} from '../../../styled/Containers';
import BaseModal from '../BaseModal';
import {View} from 'react-native';

interface Props extends SheetParams {
  isVisible: boolean;
  onBackdropPress: (props?: any) => void;
  children: any;
}

const SheetModal: React.FC<Props> = ({
  children,
  isVisible,
  onBackdropPress,
  placement,
}) => {
  return (
    <BaseModal
      id={'sheetModal'}
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
      placement={placement}>
      <View>{children}</View>
    </BaseModal>
  );
};

export default SheetModal;
