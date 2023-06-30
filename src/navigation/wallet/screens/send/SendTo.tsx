import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {BaseText, HeaderTitle, Link} from '../../../../components/styled/Text';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import styled from 'styled-components/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  ActiveOpacity,
  ScreenGutter,
} from '../../../../components/styled/Containers';
import ContactsSvg from '../../../../../assets/img/tab-icons/contacts.svg';
import {
  LightBlack,
  NeutralSlate,
  SlateDark,
  White,
} from '../../../../styles/colors';
import {RouteProp} from '@react-navigation/core';
import {WalletStackParamList} from '../../WalletStack';
import {Effect, RootState} from '../../../../store';
import {
  convertToFiat,
  formatFiatAmount,
  getErrorString,
  sleep,
} from '../../../../utils/helper-methods';
import {Key} from '../../../../store/wallet/wallet.models';
import {Rates} from '../../../../store/rate/rate.models';
import debounce from 'lodash.debounce';
import {
  CheckIfLegacyBCH,
  ValidateURI,
} from '../../../../store/wallet/utils/validations';
import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';
import {GetPayProUrl} from '../../../../store/wallet/utils/decode-uri';
import KeyWalletsRow, {
  KeyWallet,
  KeyWalletsRowProps,
} from '../../../../components/list/KeyWalletsRow';
import {
  GetPayProOptions,
  GetInvoiceCurrency,
  PayProPaymentOption,
} from '../../../../store/wallet/effects/paypro/paypro';
import {BWCErrorMessage} from '../../../../constants/BWCError';
import {startOnGoingProcessModal} from '../../../../store/app/app.effects';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../../store/app/app.actions';
import {
  AppDispatch,
  useAppDispatch,
  useAppSelector,
  useLogger,
} from '../../../../utils/hooks';
import {
  BchLegacyAddressInfo,
  CustomErrorMessage,
  Mismatch,
} from '../../components/ErrorMessages';
import {
  CoinNetwork,
  createWalletAddress,
  GetCoinAndNetwork,
  TranslateToBchCashAddress,
} from '../../../../store/wallet/effects/address/address';
import {APP_NAME_UPPERCASE} from '../../../../constants/config';
import {IsUtxoCoin} from '../../../../store/wallet/utils/currency';
import {goToAmount, incomingData} from '../../../../store/scan/scan.effects';
import {useTranslation} from 'react-i18next';
import {toFiat} from '../../../../store/wallet/utils/wallet';
import Settings from '../../../../components/settings/Settings';
import OptionsSheet, {Option} from '../../components/OptionsSheet';
import Icons from '../../components/WalletIcons';
import ContactRow from '../../../../components/list/ContactRow';
import {getCurrencyCodeFromCoinAndChain} from '../../../bitpay-id/utils/bitpay-id-utils';
import BoxInput from '../../../../components/form/BoxInput';
import {TouchableOpacity} from 'react-native';
import Back from '../../../../components/back/Back';

const ValidDataTypes: string[] = [
  'BitcoinAddress',
  'BitcoinCashAddress',
  'EthereumAddress',
  'MaticAddress',
  'RippleAddress',
  'DogecoinAddress',
  'LitecoinAddress',
  'RippleUri',
  'BitcoinUri',
  'BitcoinCashUri',
  'EthereumUri',
  'MaticUri',
  'DogecoinUri',
  'LitecoinUri',
  'BitPayUri',
];

const SafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

const ScrollView = styled.ScrollView`
  margin-left: ${ScreenGutter};
`;

const HeaderSearchContainer = styled.View`
  margin: 10px 0;
  padding: ${ScreenGutter};
`;

const SearchBox = styled(BoxInput)`
  width: 100%;
  font-size: 16px;
  position: relative;
`;

const PasteClipboardContainer = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
`;

export const ContactTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-bottom: 10px;
  border-bottom-color: ${({theme: {dark}}) => (dark ? LightBlack : '#ECEFFD')};
  border-bottom-width: 1px;
  margin-bottom: 10px;
`;

export const ContactTitle = styled(BaseText)`
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
  margin-left: 10px;
`;

export const BuildKeyWalletRow = (
  keys: {[key in string]: Key},
  currentWalletId: string,
  currentCurrencyAbbreviation: string,
  currentChain: string,
  currentNetwork: string,
  defaultAltCurrencyIsoCode: string,
  searchInput: string,
  rates: Rates,
  dispatch: AppDispatch,
) => {
  let filteredKeys: KeyWalletsRowProps<KeyWallet>[] = [];
  Object.entries(keys).forEach(([key, value]) => {
    const wallets: KeyWallet[] = [];
    value.wallets
      .filter(({hideWallet}) => !hideWallet)
      .filter(
        ({
          currencyAbbreviation,
          chain,
          id,
          network,
          credentials: {walletName},
        }) =>
          currencyAbbreviation.toLowerCase() ===
            currentCurrencyAbbreviation.toLowerCase() &&
          chain.toLowerCase() === currentChain.toLowerCase() &&
          id !== currentWalletId &&
          network === currentNetwork &&
          walletName.toLowerCase().includes(searchInput.toLowerCase()),
      )
      .map(wallet => {
        const {
          balance,
          hideWallet,
          currencyAbbreviation,
          network,
          chain,
          credentials: {walletName: fallbackName},
          walletName,
        } = wallet;
        // Clone wallet to avoid altering store values
        const _wallet = merge(cloneDeep(wallet), {
          cryptoBalance: balance.crypto,
          cryptoLockedBalance: '',
          fiatBalance: formatFiatAmount(
            convertToFiat(
              dispatch(
                toFiat(
                  balance.sat,
                  defaultAltCurrencyIsoCode,
                  currencyAbbreviation,
                  chain,
                  rates,
                ),
              ),
              hideWallet,
              network,
            ),
            defaultAltCurrencyIsoCode,
          ),
          fiatLockedBalance: '',
          currencyAbbreviation: currencyAbbreviation.toUpperCase(),
          network,
          walletName: walletName || fallbackName,
        });
        wallets.push(_wallet);
      });
    if (wallets.length) {
      const {keyName = 'My Key'} = value;
      filteredKeys.push({key, keyName, wallets});
    }
  });
  return filteredKeys;
};

const SendTo = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const route = useRoute<RouteProp<WalletStackParamList, 'SendTo'>>();

  const {keys} = useAppSelector(({WALLET}: RootState) => WALLET);
  const {rates} = useAppSelector(({RATE}) => RATE);

  const allContacts = useAppSelector(({CONTACT}: RootState) => CONTACT.list);
  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);
  const theme = useTheme();
  const placeHolderTextColor = theme.dark ? NeutralSlate : '#6F7782';
  const [searchInput, setSearchInput] = useState('');
  const [clipboardData, setClipboardData] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const {wallet} = route.params;
  const {currencyAbbreviation, id, chain, network} = wallet;

  const isUtxo = IsUtxoCoin(wallet?.currencyAbbreviation);

  const selectInputOption: Option = {
    img: <Icons.SelectInputs />,
    title: t('Select Inputs for this Transaction'),
    description: t("Choose which inputs you'd like to use to send crypto."),
    onPress: () => {
      navigation.navigate('Wallet', {
        screen: 'SendToOptions',
        params: {
          title: t('Select Inputs'),
          wallet,
          context: 'selectInputs',
        },
      });
    },
  };

  const multisendOption: Option = {
    img: <Icons.Multisend />,
    title: t('Transfer to Multiple Recipients'),
    description: t('Send crypto to multiple contacts or addresses.'),
    onPress: () => {
      navigation.navigate('Wallet', {
        screen: 'SendToOptions',
        params: {
          title: t('Multiple Recipients'),
          wallet,
          context: 'multisend',
        },
      });
    },
  };

  const assetOptions: Array<Option> = isUtxo
    ? [multisendOption, selectInputOption]
    : [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle>{t('Send To')}</HeaderTitle>,
      headerRight: () =>
        assetOptions.length ? (
          <Settings
            onPress={() => {
              setShowWalletOptions(!showWalletOptions);
            }}
          />
        ) : null,
      headerLeft: () => (
        <TouchableOpacity
          style={{marginLeft: 10}}
          activeOpacity={ActiveOpacity}
          onPress={() => {
            navigation.goBack();
          }}>
          <Back opacity={1} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, showWalletOptions]);

  const keyWallets: KeyWalletsRowProps<KeyWallet>[] = BuildKeyWalletRow(
    keys,
    id,
    currencyAbbreviation,
    chain,
    network,
    defaultAltCurrency.isoCode,
    searchInput,
    rates,
    dispatch,
  );

  const contacts = useMemo(() => {
    return allContacts.filter(
      contact =>
        contact.coin === currencyAbbreviation.toLowerCase() &&
        contact.chain === chain.toLowerCase() &&
        contact.network === network &&
        (contact.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchInput.toLowerCase())),
    );
  }, [allContacts, currencyAbbreviation, network, searchInput]);

  const onErrorMessageDismiss = () => {
    setSearchInput('');
  };

  const BchLegacyAddressInfoDismiss = (searchText: string) => {
    try {
      const cashAddr = TranslateToBchCashAddress(
        searchText.replace(/^(bitcoincash:|bchtest:)/, ''),
      );
      setSearchInput(cashAddr);
      validateAndNavigateToConfirm(cashAddr);
    } catch (error) {
      dispatch(showBottomNotificationModal(Mismatch(onErrorMessageDismiss)));
    }
  };

  const checkCoinAndNetwork =
    (data: any, isPayPro?: boolean): Effect<boolean> =>
    dispatch => {
      let isValid, addrData: CoinNetwork | null;
      if (isPayPro) {
        isValid =
          data?.chain?.toLowerCase() === chain.toLowerCase() &&
          data?.network.toLowerCase() === network.toLowerCase();
      } else {
        addrData = GetCoinAndNetwork(data, network, chain);
        isValid =
          chain === addrData?.coin.toLowerCase() &&
          network === addrData?.network;
      }

      if (isValid) {
        return true;
      } else {
        // @ts-ignore
        let addrNetwork = isPayPro ? data.network : addrData?.network;
        if (currencyAbbreviation === 'bch' && network === addrNetwork) {
          const isLegacy = CheckIfLegacyBCH(data);
          if (isLegacy) {
            const appName = APP_NAME_UPPERCASE;

            dispatch(
              showBottomNotificationModal(
                BchLegacyAddressInfo(appName, () => {
                  BchLegacyAddressInfoDismiss(data);
                }),
              ),
            );
          } else {
            dispatch(
              showBottomNotificationModal(Mismatch(onErrorMessageDismiss)),
            );
          }
        } else {
          dispatch(
            showBottomNotificationModal(Mismatch(onErrorMessageDismiss)),
          );
        }
      }
      return false;
    };

  const validateAndNavigateToConfirm = async (
    text: string,
    opts: {
      context?: string;
      name?: string;
      email?: string;
      destinationTag?: number;
    } = {},
  ) => {
    const {context, name, email, destinationTag} = opts;
    const data = ValidateURI(text);
    if (data?.type === 'PayPro' || data?.type === 'InvoiceUri') {
      try {
        const invoiceUrl = GetPayProUrl(text);
        dispatch(startOnGoingProcessModal('FETCHING_PAYMENT_OPTIONS'));

        const payProOptions = await GetPayProOptions(invoiceUrl);
        dispatch(dismissOnGoingProcessModal());
        await sleep(500);
        const invoiceCurrency = getCurrencyCodeFromCoinAndChain(
          GetInvoiceCurrency(currencyAbbreviation).toLowerCase(),
          chain,
        );
        const selected = payProOptions.paymentOptions.find(
          (option: PayProPaymentOption) =>
            option.selected && invoiceCurrency === option.currency,
        );
        if (selected) {
          const isValid = dispatch(checkCoinAndNetwork(selected, true));
          if (isValid) {
            await sleep(0);
            dispatch(
              incomingData(text, {
                wallet,
                context,
                name,
                email,
                destinationTag,
              }),
            );
          }
        } else {
          dispatch(
            showBottomNotificationModal(Mismatch(onErrorMessageDismiss)),
          );
        }
      } catch (err) {
        const formattedErrMsg = BWCErrorMessage(err);
        dispatch(dismissOnGoingProcessModal());
        await sleep(500);
        logger.warn(formattedErrMsg);
        dispatch(
          showBottomNotificationModal(
            CustomErrorMessage({errMsg: formattedErrMsg, title: 'Error'}),
          ),
        );
      }
    } else if (ValidDataTypes.includes(data?.type)) {
      if (dispatch(checkCoinAndNetwork(text))) {
        setSearchInput(text);
        await sleep(0);
        dispatch(
          incomingData(text, {wallet, context, name, email, destinationTag}),
        );
      }
    }
  };

  const onSearchInputChange = debounce((text: string) => {
    validateAndNavigateToConfirm(text);
  }, 300);

  const onSendToWallet = async (selectedWallet: KeyWallet) => {
    try {
      const {
        credentials,
        id: walletId,
        keyId,
        walletName,
        receiveAddress,
        chain,
      } = selectedWallet;

      let address = receiveAddress;

      if (!address) {
        dispatch(startOnGoingProcessModal('GENERATING_ADDRESS'));
        address = await dispatch<Promise<string>>(
          createWalletAddress({wallet: selectedWallet, newAddress: false}),
        );
        dispatch(dismissOnGoingProcessModal());
      }

      const recipient = {
        type: 'wallet',
        name: walletName || credentials.walletName,
        walletId,
        keyId,
        address,
        currency: credentials.coin,
        chain,
      };

      dispatch(
        goToAmount({
          coin: wallet.currencyAbbreviation,
          chain: wallet.chain,
          recipient,
          wallet,
        }),
      );
    } catch (err: any) {
      logger.error(`Send To: ${getErrorString(err)}`);
      dispatch(dismissOnGoingProcessModal());
    }
  };

  useEffect(() => {
    const getString = async () => {
      const clipboardData = await Clipboard.getString();
      setClipboardData(clipboardData);
    };
    getString();
  }, []);

  useEffect(() => {
    return navigation.addListener('blur', () =>
      setTimeout(() => setSearchInput(''), 300),
    );
  }, [navigation]);

  return (
    <SafeAreaView>
      <HeaderSearchContainer>
        <SearchBox
          type={t('search')}
          placeholder={t('Search contact or enter address')}
          placeholderTextColor={placeHolderTextColor}
          value={searchInput}
          onChangeText={(text: string) => {
            setSearchInput(text);
            onSearchInputChange(text);
          }}
        />

        {clipboardData ? (
          <PasteClipboardContainer
            activeOpacity={0.75}
            onPress={() => {
              setSearchInput(clipboardData);
              validateAndNavigateToConfirm(clipboardData);
            }}>
            <Link>{t('Paste from clipboard')}</Link>
          </PasteClipboardContainer>
        ) : null}
      </HeaderSearchContainer>

      <ScrollView>
        {contacts.length > 0 ? (
          <>
            <ContactTitleContainer>
              {ContactsSvg({})}
              <ContactTitle>{t('Contacts')}</ContactTitle>
            </ContactTitleContainer>

            {contacts.map((item, index) => {
              return (
                <ContactRow
                  key={index}
                  contact={item}
                  onPress={() => {
                    try {
                      if (item) {
                        validateAndNavigateToConfirm(item.address, {
                          context: 'contact',
                          name: item.name,
                          destinationTag: item.tag || item.destinationTag,
                        });
                      }
                    } catch (err) {
                      logger.error(
                        `Send To [Contacts]: ${getErrorString(err)}`,
                      );
                    }
                  }}
                />
              );
            })}
          </>
        ) : null}

        <KeyWalletsRow
          keyWallets={keyWallets}
          hideBalance={hideAllBalances}
          onPress={(selectedWallet: KeyWallet) => {
            onSendToWallet(selectedWallet);
          }}
        />
      </ScrollView>

      <OptionsSheet
        isVisible={showWalletOptions}
        closeModal={() => setShowWalletOptions(!showWalletOptions)}
        options={assetOptions}
      />
    </SafeAreaView>
  );
};

export default SendTo;
