import React, {useCallback, useLayoutEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import styled from 'styled-components/native';
import {RouteProp} from '@react-navigation/core';
import {useAppDispatch} from '../../../utils/hooks';
import {
  Recipient,
  TransactionProposal,
  TxDetails,
  Wallet,
} from '../../../store/wallet/wallet.models';
import {sleep} from '../../../utils/helper-methods';
import {startOnGoingProcessModal} from '../../../store/app/app.effects';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../store/app/app.actions';
import {WalletConnectStackParamList} from '../WalletConnectStack';
import Button from '../../../components/button/Button';
import {
  CustomErrorMessage,
  WrongPasswordError,
} from '../../wallet/components/ErrorMessages';
import {BWCErrorMessage} from '../../../constants/BWCError';
import {BottomNotificationConfig} from '../../../components/modal/bottom-notification/BottomNotification';
import {
  Amount,
  ConfirmContainer,
  ConfirmScrollView,
  ExchangeRate,
  Fee,
  Header,
  SendingFrom,
  SendingTo,
  SharedDetailRow,
} from '../../wallet/screens/send/confirm/Shared';
import {GetFeeOptions} from '../../../store/wallet/effects/fee/fee';
import {Trans, useTranslation} from 'react-i18next';
import Banner from '../../../components/banner/Banner';
import {BaseText} from '../../../components/styled/Text';
import {Hr, ScreenGutter} from '../../../components/styled/Containers';
import {
  walletConnectV2ApproveCallRequest,
  walletConnectV2RejectCallRequest,
} from '../../../store/wallet-connect-v2/wallet-connect-v2.effects';
import {AppActions} from '../../../store/app';

const HeaderRightContainer = styled.View`
  margin-right: 15px;
`;

const ButtonContainer = styled.View`
  padding: 0 ${ScreenGutter};
  margin: 15px 0;
`;

export interface WalletConnectConfirmParamList {
  wallet: Wallet;
  recipient: Recipient;
  txp: Partial<TransactionProposal>;
  txDetails: TxDetails;
  request: any;
  amount: number;
  data: string;
  peerName?: string;
}

const WalletConnectConfirm = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<WalletConnectStackParamList, 'WalletConnectConfirm'>>();
  const {wallet, txDetails, request, peerName} = route.params;

  const {
    fee,
    sendingTo,
    sendingFrom,
    subTotal,
    gasLimit,
    gasPrice,
    nonce,
    total,
    rateStr,
  } = txDetails;

  const feeOptions = GetFeeOptions(wallet.chain);

  const approveCallRequest = async () => {
    try {
      dispatch(startOnGoingProcessModal('SENDING_PAYMENT'));
      await dispatch(walletConnectV2ApproveCallRequest(request, wallet));
      dispatch(dismissOnGoingProcessModal());
      await sleep(1000);
      dispatch(
        AppActions.showPaymentSentModal({
          onDismissModal: async () => {
            navigation.goBack();
          },
        }),
      );
    } catch (err) {
      dispatch(dismissOnGoingProcessModal());
      switch (err) {
        case 'invalid password':
          dispatch(showBottomNotificationModal(WrongPasswordError()));
          break;
        case 'password canceled':
          break;
        default:
          await showErrorMessage(
            CustomErrorMessage({
              errMsg: BWCErrorMessage(err),
              title: t('Uh oh, something went wrong'),
            }),
          );
      }
    }
  };

  const showErrorMessage = useCallback(
    async (msg: BottomNotificationConfig) => {
      await sleep(500);
      dispatch(showBottomNotificationModal(msg));
    },
    [dispatch],
  );

  const rejectCallRequest = useCallback(async () => {
    try {
      dispatch(startOnGoingProcessModal('REJECTING_CALL_REQUEST'));
      await dispatch(walletConnectV2RejectCallRequest(request));
      dispatch(dismissOnGoingProcessModal());
      await sleep(1000);
      navigation.goBack();
    } catch (err) {
      await showErrorMessage(
        CustomErrorMessage({
          errMsg: BWCErrorMessage(err),
          title: t('Uh oh, something went wrong'),
        }),
      );
    }
  }, [dispatch, navigation, request, showErrorMessage, t]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRightContainer>
          <Button onPress={rejectCallRequest} buttonType="pill">
            {t('Reject')}
          </Button>
        </HeaderRightContainer>
      ),
    });
  }, [navigation, rejectCallRequest, t]);

  return (
    <ConfirmContainer>
      <ConfirmScrollView>
        <Header>Summary</Header>
        <Banner
          type={'warning'}
          description={''}
          transComponent={
            <Trans
              i18nKey="WalletConnectBannerConfirm"
              values={{peerName}}
              components={[<BaseText style={{fontWeight: 'bold'}} />]}
            />
          }
        />
        <Hr />
        <SendingTo recipient={sendingTo} hr />
        <Fee fee={fee} feeOptions={feeOptions} hideFeeOptions={true} hr />
        {gasPrice !== undefined ? (
          <SharedDetailRow
            description={t('Gas price')}
            value={gasPrice.toFixed(2) + ' Gwei'}
            hr
          />
        ) : null}
        {gasLimit !== undefined ? (
          <SharedDetailRow description={t('Gas limit')} value={gasLimit} hr />
        ) : null}
        {nonce !== undefined && nonce !== null ? (
          <SharedDetailRow description={'Nonce'} value={nonce} hr />
        ) : null}
        <SendingFrom sender={sendingFrom} hr />
        {rateStr ? (
          <ExchangeRate description={t('Exchange Rate')} rateStr={rateStr} />
        ) : null}
        <Amount description={t('SubTotal')} amount={subTotal} />
        <Amount description={t('Total')} amount={total} />
      </ConfirmScrollView>
      <ButtonContainer>
        <Button onPress={approveCallRequest}>{t('Click to approve')}</Button>
      </ButtonContainer>
    </ConfirmContainer>
  );
};

export default WalletConnectConfirm;
