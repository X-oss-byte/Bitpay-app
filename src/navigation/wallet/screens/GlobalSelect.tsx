import React, {
  ReactElement,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import styled from 'styled-components/native';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {SUPPORTED_COINS, SUPPORTED_TOKENS} from '../../../constants/currencies';
import {Wallet} from '../../../store/wallet/wallet.models';
import {
  convertToFiat,
  formatFiatAmount,
  getCurrencyAbbreviation,
  keyExtractor,
  sleep,
} from '../../../utils/helper-methods';
import {FlatList, Pressable, View} from 'react-native';
import GlobalSelectRow from '../../../components/list/GlobalSelectRow';
import SheetModal from '../../../components/modal/base/sheet/SheetModal';
import {ScreenGutter} from '../../../components/styled/Containers';
import _ from 'lodash';
import KeyWalletsRow, {
  KeyWallet,
  KeyWalletsRowProps,
} from '../../../components/list/KeyWalletsRow';
import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';
import {LightBlack, White} from '../../../styles/colors';
import {
  H4,
  TextAlign,
  BaseText,
  HeaderTitle,
} from '../../../components/styled/Text';
import {RouteProp, useRoute} from '@react-navigation/core';
import {WalletScreens, WalletStackParamList} from '../WalletStack';
import {useNavigation} from '@react-navigation/native';
import ReceiveAddress from '../components/ReceiveAddress';
import {
  createProposalAndBuildTxDetails,
  handleCreateTxProposalError,
} from '../../../store/wallet/effects/send/send';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../store/app/app.actions';
import {Effect} from '../../../store';
import {BitpaySupportedTokenOpts} from '../../../constants/tokens';
import {startOnGoingProcessModal} from '../../../store/app/app.effects';
import {ButtonState} from '../../../components/button/Button';
import {useTranslation} from 'react-i18next';
import {toFiat} from '../../../store/wallet/utils/wallet';
import {LogActions} from '../../../store/log';

const SafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

export const WalletSelectMenuContainer = styled.View`
  background: ${({theme: {dark}}) => (dark ? LightBlack : White)};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export interface WalletSelectMenuHeaderContainerParams {
  currency?: string;
}

export const WalletSelectMenuHeaderContainer = styled.View<WalletSelectMenuHeaderContainerParams>`
  padding: 20px;
  padding-left: 12px;
  padding-bottom: ${({currency}) => (currency ? 14 : 0)}px;
  flex-direction: row;
  justify-content: ${({currency}) => (currency ? 'flex-start' : 'center')};
  align-items: center;
  border-bottom-color: ${({theme: {dark}}) => (dark ? LightBlack : '#ECEFFD')};
  border-bottom-width: ${({currency}) => (currency ? 1 : 0)}px;
`;

export const WalletSelectMenuHeaderIconContainer = styled.View`
  padding-right: 0px;
`;

export const WalletSelectMenuBodyContainer = styled.View`
  padding-left: ${ScreenGutter};
`;

const NoWalletsMsg = styled(BaseText)`
  font-size: 15px;
  text-align: center;
  margin-top: 20px;
`;

export type GlobalSelectParamList = {
  context: 'send' | 'receive' | 'coinbase' | 'contact' | 'scanner';
  recipient?: {
    address: string;
    currency: string;
    chain: string;
    name?: string;
    type?: string;
    network?: string;
    destinationTag?: number;
    opts?: {
      sendMax?: boolean | undefined;
      message?: string;
      feePerKb?: number;
      showERC20Tokens?: boolean;
    };
  };
  amount?: number;
};

export interface GlobalSelectObj {
  id: string;
  currencyName: string;
  img: string | ((props?: any) => ReactElement);
  badgeImg?: string | ((props?: any) => ReactElement);
  total: number;
  availableWalletsByKey: {
    [key in string]: Wallet[];
  };
}

const buildList = (category: string[], wallets: Wallet[]) => {
  const coins: GlobalSelectObj[] = [];

  category.forEach(coin => {
    const availableWallets = wallets.filter(
      wallet =>
        getCurrencyAbbreviation(wallet.currencyAbbreviation, wallet.chain) ===
        coin,
    );
    if (availableWallets.length) {
      const {currencyName, img, badgeImg} = availableWallets[0];
      coins.push({
        id: Math.random().toString(),
        currencyName,
        img,
        badgeImg,
        total: availableWallets.length,
        availableWalletsByKey: _.groupBy(
          availableWallets,
          wallet => wallet.keyId,
        ),
      });
    }
  });
  return coins;
};

export type GlobalSelectModalContext =
  | 'send'
  | 'receive'
  | 'coinbase'
  | 'contact';

interface GlobalSelectProps {
  modalTitle?: string;
  customSupportedCurrencies?: string[];
  onDismiss?: (newWallet?: any) => void;
  modalContext?: GlobalSelectModalContext;
  livenetOnly?: boolean;
  onHelpPress?: () => void;
}

const GlobalSelect: React.FC<GlobalSelectProps> = ({
  customSupportedCurrencies,
  onDismiss,
  livenetOnly,
}) => {
  const {t} = useTranslation();
  const route = useRoute<RouteProp<WalletStackParamList, 'GlobalSelect'>>();
  let {context, recipient, amount} = route.params || {};
  const dispatch = useAppDispatch();
  const {keys, tokenOptions, customTokenOptions} = useAppSelector(
    ({WALLET}) => WALLET,
  );
  const {rates} = useAppSelector(({RATE}) => RATE);
  const allTokens = {
    ...BitpaySupportedTokenOpts,
    ...tokenOptions,
    ...customTokenOptions,
  };
  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);
  const [showReceiveAddressBottomModal, setShowReceiveAddressBottomModal] =
    useState(false);
  const [receiveWallet, setReceiveWallet] = useState<Wallet>();
  const navigation = useNavigation();
  const [walletSelectModalVisible, setWalletSelectModalVisible] =
    useState(false);
  // object to pass to select modal
  const [keyWallets, setKeysWallets] =
    useState<KeyWalletsRowProps<KeyWallet>[]>();

  const NON_BITPAY_SUPPORTED_TOKENS = Object.keys(allTokens).filter(
    token => !SUPPORTED_TOKENS.includes(token),
  );

  // all wallets
  let wallets = Object.values(keys)
    .filter(key => key.backupComplete)
    .flatMap(key => key.wallets);

  // Filter hidden and incomplete wallets
  wallets = wallets.filter(wallet => !wallet.hideWallet && wallet.isComplete());

  // only show wallets with funds
  if (['send', 'coinbase', 'contact', 'scanner'].includes(context)) {
    wallets = wallets.filter(wallet => wallet.balance.sat > 0);
  }

  if (recipient && ['coinbase', 'contact', 'scanner'].includes(context)) {
    if (recipient.currency && recipient.chain) {
      wallets = wallets.filter(
        wallet =>
          wallet.currencyAbbreviation === recipient?.currency &&
          wallet.chain === recipient?.chain,
      );
    }
    if (recipient?.network) {
      wallets = wallets.filter(wallet => wallet.network === recipient?.network);
    }
  }

  if (livenetOnly) {
    wallets = wallets.filter(wallet => wallet.network === 'livenet');
  }

  const supportedCoins = useMemo(
    () =>
      buildList(
        customSupportedCurrencies ? customSupportedCurrencies : SUPPORTED_COINS,
        wallets,
      ),
    [wallets, customSupportedCurrencies],
  );

  const supportedTokens = useMemo(
    () => buildList(customSupportedCurrencies ? [] : SUPPORTED_TOKENS, wallets),
    [wallets, customSupportedCurrencies],
  );

  const otherTokens = useMemo(
    () =>
      buildList(
        customSupportedCurrencies ? [] : NON_BITPAY_SUPPORTED_TOKENS,
        wallets,
      ),
    [wallets, customSupportedCurrencies, NON_BITPAY_SUPPORTED_TOKENS],
  );

  const data = [...supportedCoins, ...supportedTokens, ...otherTokens];

  const openKeyWalletSelector = useCallback(
    (selectObj: GlobalSelectObj) => {
      setKeysWallets(
        Object.keys(selectObj.availableWalletsByKey).map(keyId => {
          const key = keys[keyId];
          return {
            key: keyId,
            keyName: key.keyName || 'My Key',
            wallets: selectObj.availableWalletsByKey[keyId]
              .filter(wallet => !wallet.hideWallet)
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
                return merge(cloneDeep(wallet), {
                  cryptoBalance: balance.crypto,
                  cryptoLockedBalance: balance.cryptoLocked,
                  fiatBalance: formatFiatAmount(
                    convertToFiat(
                      dispatch(
                        toFiat(
                          balance.sat,
                          defaultAltCurrency.isoCode,
                          currencyAbbreviation,
                          chain,
                          rates,
                        ),
                      ),
                      hideWallet,
                      network,
                    ),
                    defaultAltCurrency.isoCode,
                  ),
                  fiatLockedBalance: formatFiatAmount(
                    convertToFiat(
                      dispatch(
                        toFiat(
                          balance.satLocked,
                          defaultAltCurrency.isoCode,
                          currencyAbbreviation,
                          chain,
                          rates,
                        ),
                      ),
                      hideWallet,
                      network,
                    ),
                    defaultAltCurrency.isoCode,
                  ),
                  currencyAbbreviation: currencyAbbreviation.toUpperCase(),
                  network,
                  walletName: walletName || fallbackName,
                });
              }),
          };
        }),
      );
      setWalletSelectModalVisible(true);
    },
    [keys],
  );

  const onWalletSelect = useCallback(
    async (wallet: Wallet) => {
      if (['coinbase', 'contact', 'scanner'].includes(context)) {
        setWalletSelectModalVisible(false);
        const {name, address, type, destinationTag, opts} = recipient!;
        if (!address) {
          return;
        }

        try {
          const sendTo = {
            name,
            type: type || context,
            address,
            destinationTag,
          };

          if (!amount) {
            navigation.navigate('Wallet', {
              screen: WalletScreens.AMOUNT,
              params: {
                cryptoCurrencyAbbreviation:
                  wallet.currencyAbbreviation.toUpperCase(),
                chain: wallet.chain,
                onAmountSelected: async (amount, setButtonState, opts) => {
                  dispatch(
                    _createProposalAndBuildTxDetails({
                      wallet,
                      amount: Number(amount),
                      sendTo,
                      setButtonState,
                      opts,
                    }),
                  );
                },
              },
            });
          } else {
            dispatch(
              _createProposalAndBuildTxDetails({
                wallet,
                amount: Number(amount),
                sendTo,
                opts,
              }),
            );
          }
        } catch (err) {
          const errStr =
            err instanceof Error ? err.message : JSON.stringify(err);
          dispatch(LogActions.error('[GlobalSelect] ' + errStr));
        }
      } else if (context === 'send') {
        setWalletSelectModalVisible(false);
        navigation.navigate('Wallet', {
          screen: 'SendTo',
          params: {wallet},
        });
      } else {
        setReceiveWallet(wallet);
        setShowReceiveAddressBottomModal(true);
      }
    },
    [context, navigation, onDismiss, recipient],
  );

  const _createProposalAndBuildTxDetails =
    ({
      wallet,
      amount,
      sendTo,
      setButtonState,
      opts,
    }: {
      wallet: Wallet;
      amount: number;
      sendTo: {
        name: string | undefined;
        type: string;
        address: string;
        destinationTag?: number;
      };
      setButtonState?: (state: ButtonState) => void;
      opts: any;
    }): Effect<Promise<void>> =>
    async dispatch => {
      try {
        if (setButtonState) {
          setButtonState('loading');
        } else {
          await dispatch(startOnGoingProcessModal('CREATING_TXP'));
        }
        const {txDetails, txp} = await dispatch(
          createProposalAndBuildTxDetails({
            wallet,
            recipient: sendTo,
            amount,
            ...opts,
          }),
        );
        if (setButtonState) {
          setButtonState('success');
        } else {
          dispatch(dismissOnGoingProcessModal());
        }
        await sleep(300);
        navigation.navigate('Wallet', {
          screen: 'Confirm',
          params: {
            wallet,
            recipient: sendTo,
            txp,
            txDetails,
            amount,
            message: opts?.message,
          },
        });
      } catch (err: any) {
        const errStr = err instanceof Error ? err.message : JSON.stringify(err);
        dispatch(LogActions.error('[GlobalSelect] ' + errStr));
        if (setButtonState) {
          setButtonState('failed');
        } else {
          dispatch(dismissOnGoingProcessModal());
        }
        const [errorMessageConfig] = await Promise.all([
          dispatch(handleCreateTxProposalError(err)),
          sleep(400),
        ]);
        dispatch(
          showBottomNotificationModal({
            ...errorMessageConfig,
            enableBackdropDismiss: false,
            actions: [
              {
                text: t('OK'),
                action: () => {
                  if (setButtonState) {
                    setButtonState(undefined);
                  }
                },
              },
            ],
          }),
        );
      }
    };

  const renderItem = useCallback(
    ({item}: {item: GlobalSelectObj}) => {
      return (
        <GlobalSelectRow
          item={item}
          emit={selectObj => {
            // if only one wallet - skip wallet selector
            const wallets = Object.values(
              selectObj.availableWalletsByKey,
            ).flat();
            if (wallets.length === 1) {
              onWalletSelect(wallets[0]);
            } else {
              openKeyWalletSelector(selectObj);
            }
          }}
          key={item.id}
        />
      );
    },
    [onWalletSelect, openKeyWalletSelector],
  );

  const closeModal = () => {
    setShowReceiveAddressBottomModal(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <HeaderTitle>
            {walletSelectModalVisible
              ? t('Select a wallet')
              : t('Select a currency')}
          </HeaderTitle>
        );
      },
    });
  }, [navigation, t, walletSelectModalVisible]);

  useEffect(() => {
    if (!wallets[0]) {
      // No wallets available
      // TODO: show warning
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [navigation, wallets]);

  return (
    <SafeAreaView>
      <View>
        {data.length > 0 && (
          <FlatList
            contentContainerStyle={{paddingBottom: 100}}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
          />
        )}
        {data.length === 0 && context === 'send' && (
          <NoWalletsMsg>
            {t(
              'There are no wallets with funds available to use this feature.',
            )}
          </NoWalletsMsg>
        )}
        <SheetModal
          fullScreen={true}
          isVisible={walletSelectModalVisible}
          onBackdropPress={() => setWalletSelectModalVisible(false)}>
          <WalletSelectMenuContainer>
            <WalletSelectMenuBodyContainer>
              <KeyWalletsRow
                keyWallets={keyWallets!}
                hideBalance={hideAllBalances}
                onPress={onWalletSelect}
              />
            </WalletSelectMenuBodyContainer>
            {/*Nested receive modal*/}
            {receiveWallet && (
              <ReceiveAddress
                isVisible={showReceiveAddressBottomModal}
                closeModal={closeModal}
                wallet={receiveWallet}
              />
            )}
          </WalletSelectMenuContainer>
        </SheetModal>
        {/*Receive modal if one wallet*/}
        {receiveWallet && !walletSelectModalVisible && (
          <ReceiveAddress
            isVisible={showReceiveAddressBottomModal}
            closeModal={closeModal}
            wallet={receiveWallet}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default GlobalSelect;
