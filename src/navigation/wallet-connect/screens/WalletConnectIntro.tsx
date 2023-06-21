import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useAppDispatch} from '../../../utils/hooks';
import styled from 'styled-components/native';
import Button from '../../../components/button/Button';
import {Link, Paragraph} from '../../../components/styled/Text';
import {
  ScrollView,
  WalletConnectContainer,
} from '../styled/WalletConnectContainers';
import {openUrlWithInAppBrowser} from '../../../store/app/app.effects';
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
import WCV1WalletSelector from '../components/WCV1WalletSelector';
import WCV2WalletSelector from '../components/WCV2WalletSelector';
import {SignClientTypes} from '@walletconnect/types';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import yup from '../../../lib/yup';
import BoxInput from '../../../components/form/BoxInput';

export type WalletConnectIntroParamList = {
  uri?: string;
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
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<{uri: string}>({resolver: yupResolver(schema)});

  const route = useRoute<RouteProp<{params: WalletConnectIntroParamList}>>();
  // version 1
  const {uri, proposal} = route.params || {};
  const [dappUri, setDappUri] = useState<string>();
  const [walletSelectorModalVisible, setWalletSelectorModalVisible] =
    useState(false);
  const showWalletSelector = () => setWalletSelectorModalVisible(true);
  const hideWalletSelector = () => setWalletSelectorModalVisible(false);

  // version 2
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
    if (uri) {
      setDappUri(uri);
      showWalletSelector();
    }
  }, [uri]);

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
                placeholder={'Wallet connect URI'}
                label={t('URI')}
                onBlur={onBlur}
                onChangeText={async (data: string) => {
                  onChange(data);
                  try {
                    if (isValidWalletConnectUri(data)) {
                      const {version} = parseUri(data);
                      if (version === 1) {
                        await sleep(500);
                        setDappUri(data);
                        showWalletSelector();
                      } else {
                        // temporarily disabled
                        const errMsg = t(
                          'Connection cannot be established. WalletConnect version 2 is still under development.',
                        );
                        throw new Error(errMsg);
                      }
                    }
                  } catch (e: any) {
                    setDappUri(undefined);
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
      {dappUri ? (
        <WCV1WalletSelector
          isVisible={walletSelectorModalVisible}
          dappUri={dappUri}
          onBackdropPress={hideWalletSelector}
        />
      ) : null}
    </WalletConnectContainer>
  );
};

export default WalletConnectIntro;
