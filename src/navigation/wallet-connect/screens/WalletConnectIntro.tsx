import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useAppDispatch} from '../../../utils/hooks';
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
import {BWCErrorMessage} from '../../../constants/BWCError';
import {isValidWalletConnectUri} from '../../../store/wallet/utils/validations';
import {parseUri} from '@walletconnect/utils';
import WCV2WalletSelector from '../components/WCV2WalletSelector';
import {SignClientTypes} from '@walletconnect/types';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import yup from '../../../lib/yup';
import BoxInput from '../../../components/form/BoxInput';
import {walletConnectV2OnSessionProposal} from '../../../store/wallet-connect-v2/wallet-connect-v2.effects';

export type WalletConnectIntroParamList = {
  proposal?: SignClientTypes.EventArguments['session_proposal'];
};

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

  const route = useRoute<RouteProp<{params: WalletConnectIntroParamList}>>();
  
  // version 2
  const {proposal} = route.params || {};
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

  useEffect(() => {
    if (proposal) {
      setDappProposal(proposal);
      showWalletSelectorV2();
    }
  }, [proposal]);

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
            render={({field: {onChange, onBlur, value}}) => (
              <BoxInput
                placeholder={'WalletConnect URI'}
                label={t('URI')}
                onBlur={onBlur}
                onChangeText={async (data: string) => {
                  onChange(data);
                  try {
                    if (isValidWalletConnectUri(data)) {
                      const {version} = parseUri(data);
                      if (version === 1) {
                        const errMsg = t(
                          'The uri corresponds to WalletConnect v1.0 which has now been shut down on June 28.',
                        );
                        throw new Error(errMsg);
                      } else {
                        dispatch(startOnGoingProcessModal('LOADING'));
                        const _proposal = (await dispatch<any>(
                          walletConnectV2OnSessionProposal(data),
                        )) as any;
                        setDappProposal(_proposal);
                        dispatch(dismissOnGoingProcessModal());
                        await sleep(500);
                        showWalletSelectorV2();
                      }
                    }
                  } catch (e: any) {
                    setDappProposal(undefined);
                    dispatch(dismissOnGoingProcessModal());
                    await sleep(500);
                    await showErrorMessage(
                      CustomErrorMessage({
                        errMsg: BWCErrorMessage(e),
                        title: t('Uh oh, something went wrong'),
                      }),
                    );
                  }
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
