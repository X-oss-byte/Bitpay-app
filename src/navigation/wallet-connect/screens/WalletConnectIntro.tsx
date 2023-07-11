import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import styled from 'styled-components/native';
import {Link, Paragraph} from '../../../components/styled/Text';
import {
  ScrollView,
  WalletConnectContainer,
} from '../styled/WalletConnectContainers';
import {
  openUrlWithInAppBrowser,
  startOnGoingProcessModal,
} from '../../../store/app/app.effects';
import {useTranslation} from 'react-i18next';
import {BottomNotificationConfig} from '../../../components/modal/bottom-notification/BottomNotification';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../store/app/app.actions';
import {sleep} from '../../../utils/helper-methods';
import {CustomErrorMessage} from '../../wallet/components/ErrorMessages';
import {isValidWalletConnectUri} from '../../../store/wallet/utils/validations';
import {parseUri} from '@walletconnect/utils';
import WCV2WalletSelector from '../components/WCV2WalletSelector';
import {SignClientTypes} from '@walletconnect/types';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import yup from '../../../lib/yup';
import BoxInput from '../../../components/form/BoxInput';
import {walletConnectV2OnSessionProposal} from '../../../store/wallet-connect-v2/wallet-connect-v2.effects';
import { BWCErrorMessage } from '../../../constants/BWCError';

export type WalletConnectIntroParamList = {};

const InputContainer = styled.View``;

const LinkContainer = styled.View`
  padding-top: 5px;
  padding-bottom: 20px;
`;

const schema = yup.object().shape({
  uri: yup.string(),
});

const WalletConnectIntro = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {
    control,
    formState: {errors},
  } = useForm<{uri: string}>({resolver: yupResolver(schema)});

  // version 2
  const {proposal} = useAppSelector(({WALLET_CONNECT_V2}) => WALLET_CONNECT_V2);
  const [dappProposal, setDappProposal] = useState<any>();
  const [walletSelectorV2ModalVisible, setWalletSelectorV2ModalVisible] =
    useState(false);
  const showWalletSelectorV2 = () => setWalletSelectorV2ModalVisible(true);
  const hideWalletSelectorV2 = () => setWalletSelectorV2ModalVisible(false);

  const showErrorMessage = useCallback(
    async (msg: BottomNotificationConfig) => {
      await sleep(500);
      dispatch(showBottomNotificationModal(msg));
    },
    [dispatch],
  );

  const setProposal = async (
    proposal?: SignClientTypes.EventArguments['session_proposal'],
  ) => {
    dispatch(dismissOnGoingProcessModal());
    await sleep(500);
    setDappProposal(proposal);
    showWalletSelectorV2();
  };

  useEffect(() => {
    setProposal(proposal);
  }, [proposal]);

  const validateWalletConnectUri = async (data: string) => {
    try{
      if (isValidWalletConnectUri(data)) {
        const {version} = parseUri(data);
        if (version === 1) {
          const errMsg = t(
            'The URI corresponds to WalletConnect v1.0, which was shut down on June 28.',
          );
          throw errMsg;
        } else {
          dispatch(startOnGoingProcessModal('LOADING'));
          await dispatch(walletConnectV2OnSessionProposal(data));
        }
      } 
    } catch (err) {
      dispatch(dismissOnGoingProcessModal());
      await sleep(500);
      await showErrorMessage(
        CustomErrorMessage({
          errMsg: BWCErrorMessage(err),
          title: t('Uh oh, something went wrong'),
        }),
      );
    }
  };

  return (
    <WalletConnectContainer>
      <ScrollView>
        <Paragraph>
          {t(
            'WalletConnect is an open source protocol for connecting decentralized applications to mobile wallets with QR code scanning or deep linking.',
          )}
        </Paragraph>
        <LinkContainer>
          <TouchableOpacity
            onPress={() => {
              dispatch(openUrlWithInAppBrowser('https://walletconnect.org/'));
            }}>
            <Link>{t('Learn More')}</Link>
          </TouchableOpacity>
        </LinkContainer>
        <InputContainer>
          <Controller
            control={control}
            render={({field: {onBlur, value}}) => (
              <BoxInput
                placeholder={'WalletConnect URI'}
                label={t('URI')}
                onBlur={onBlur}
                onChangeText={(data: string) => {
                  validateWalletConnectUri(data);
                }}
                error={errors.uri?.message}
                value={value}
              />
            )}
            name="uri"
            defaultValue=""
          />
        </InputContainer>
      </ScrollView>
      {dappProposal ? (
        <WCV2WalletSelector
          isVisible={walletSelectorV2ModalVisible}
          proposal={dappProposal}
          onBackdropPress={hideWalletSelectorV2}
        />
      ) : null}
    </WalletConnectContainer>
  );
};

export default WalletConnectIntro;
