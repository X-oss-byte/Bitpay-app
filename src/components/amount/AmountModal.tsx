import React from 'react';
import styled from 'styled-components/native';
import Button from '../../components/button/Button';
import {BaseText, Paragraph} from '../../components/styled/Text';
import {Action, White} from '../../styles/colors';
import SheetModal from '../modal/base/sheet/SheetModal';
import Amount, {AmountProps} from './Amount';
import {useTranslation} from 'react-i18next';

const ModalHeaderText = styled(BaseText)`
  font-size: 18px;
  font-weight: bold;
`;
const ModalHeader = styled.View`
  height: 50px;
  margin: 10px 10px 10px 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const ModalHeaderRight = styled(BaseText)`
  position: absolute;
  right: 5px;
`;

const StyledAmountModalContainer = styled.SafeAreaView`
  flex: 1;
`;

const CloseButton = styled.TouchableOpacity`
  margin: auto;
`;

const CloseButtonText = styled(Paragraph)`
  color: ${({theme: {dark}}) => (dark ? White : Action)};
`;

type AmountModalProps = AmountProps & {
  isVisible: boolean;
  onClose: () => void;
  modalTitle?: string;
  onSendMaxPressed?: () => any;
};

const AmountModal: React.VFC<AmountModalProps> = props => {
  const {onClose, onSendMaxPressed, isVisible, modalTitle, ...amountProps} =
    props;
  const {t} = useTranslation();

  return (
    <SheetModal
      isVisible={isVisible}
      fullScreen={true}
      onBackdropPress={onClose}>
      <StyledAmountModalContainer>
        <ModalHeader>
          {modalTitle ? <ModalHeaderText>{modalTitle}</ModalHeaderText> : null}
          {onSendMaxPressed ? (
            <ModalHeaderRight>
              <Button
                buttonType="pill"
                buttonStyle="cancel"
                onPress={() => onSendMaxPressed()}>
                Send Max
              </Button>
            </ModalHeaderRight>
          ) : null}
        </ModalHeader>

        <Amount {...amountProps} onSendMaxPressed={onSendMaxPressed} />
        <CloseButton
          onPress={() => {
            onClose?.();
          }}>
          <CloseButtonText>{t('CLOSE')}</CloseButtonText>
        </CloseButton>
      </StyledAmountModalContainer>
    </SheetModal>
  );
};

export default AmountModal;
