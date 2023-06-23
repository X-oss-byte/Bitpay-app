import React from 'react';
import styled from 'styled-components/native';
import {Success, White} from '../../../styles/colors';
import PaymentCompleteSvg from '../../../../assets/img/wallet/payment-complete.svg';
import {BaseText} from '../../../components/styled/Text';
import {useTranslation} from 'react-i18next';
import SheetModal from '../../../components/modal/base/sheet/SheetModal';
import {useAppDispatch} from '../../../utils/hooks';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {AppActions} from '../../../store/app';

const PaymentSentContainer = styled.View`
  flex: 1;
  background-color: ${Success};
`;

const PaymentSentHero = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const PaymentSentFooter = styled.View`
  border-top-width: 1px;
  border-top-color: ${White};
  align-items: center;
`;

const Title = styled(BaseText)`
  font-size: 28px;
  font-weight: 500;
  color: ${White};
  margin-top: 15px;
`;

const CloseButton = styled.TouchableOpacity`
  margin: 15px 0;
  padding: 5px;
`;

const CloseText = styled(BaseText)`
  font-weight: 500;
  font-size: 18px;
  color: ${White};
`;

export interface PaymentSentConfig {
  onDismissModal: () => void;
  title?: string;
}

const PaymentSent = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const isVisible = useSelector(({APP}: RootState) => APP.showPaymentSentModal);
  const paymentSentConfig = useSelector(
    ({APP}: RootState) => APP.paymentSentConfig,
  );

  const {onDismissModal, title} = paymentSentConfig || {};

  const onCloseModal = () => {
    dispatch(AppActions.dismissPaymentSentModal());
    setTimeout(() => {
      dispatch(AppActions.resetPaymentSentConfig());
    }, 500); // Wait for modal to close
    onDismissModal && onDismissModal();
  };

  return (
    <SheetModal
      isVisible={isVisible}
      fullScreen={true}
      onBackdropPress={onCloseModal}>
      <PaymentSentContainer>
        <PaymentSentHero>
          <PaymentCompleteSvg />
          <Title>{title || t('Payment Sent')}</Title>
        </PaymentSentHero>
        <PaymentSentFooter>
          <CloseButton
            onPress={() => {
              onCloseModal();
            }}>
            <CloseText>{t('CLOSE')}</CloseText>
          </CloseButton>
        </PaymentSentFooter>
      </PaymentSentContainer>
    </SheetModal>
  );
};

export default PaymentSent;
