import React from 'react';
import styled from 'styled-components/native';
import SheetModal from '../modal/base/sheet/SheetModal';
import Amount, {AmountProps} from './Amount';

const StyledAmountModalContainer = styled.SafeAreaView`
  flex: 1;
`;

type AmountModalProps = AmountProps & {
  isVisible: boolean;
  onClose: () => void;
  modalTitle?: string;
  onSendMaxPressed?: () => any;
};

const AmountModal: React.VFC<AmountModalProps> = props => {
  const {onClose, onSendMaxPressed, isVisible, ...amountProps} = props;

  return (
    <SheetModal
      isVisible={isVisible}
      fullScreen={true}
      onBackdropPress={onClose}>
      <StyledAmountModalContainer>
        <Amount {...amountProps} onSendMaxPressed={onSendMaxPressed} />
      </StyledAmountModalContainer>
    </SheetModal>
  );
};

export default AmountModal;
