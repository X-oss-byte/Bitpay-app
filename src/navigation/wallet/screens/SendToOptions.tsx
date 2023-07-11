import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {
  BaseText,
  H5,
  H7,
  HeaderTitle,
  SubText,
} from '../../../components/styled/Text';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {WalletStackParamList} from '../WalletStack';
import {
  Recipient,
  TransactionOptionsContext,
  TxDetailsSendingTo,
  Wallet,
} from '../../../store/wallet/wallet.models';
import {CurrencyImage} from '../../../components/currency-image/CurrencyImage';
import {
  CtaContainer as _CtaContainer,
  ActiveOpacity,
  Hr,
  ScreenGutter,
  SearchContainer,
  SearchInput,
} from '../../../components/styled/Containers';
import {FlatList, TouchableOpacity, View} from 'react-native';
import WalletIcons from '../components/WalletIcons';
import _ from 'lodash';
import AmountModal from '../../../components/amount/AmountModal';
import {
  createProposalAndBuildTxDetails,
  handleCreateTxProposalError,
} from '../../../store/wallet/effects/send/send';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../store/app/app.actions';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {startOnGoingProcessModal} from '../../../store/app/app.effects';
import Back from '../../../components/back/Back';
import Button from '../../../components/button/Button';
import KeyWalletsRow, {
  KeyWallet,
  KeyWalletsRowProps,
} from '../../../components/list/KeyWalletsRow';
import debounce from 'lodash.debounce';
import {
  CheckIfLegacyBCH,
  ValidateURI,
} from '../../../store/wallet/utils/validations';
import {
  ExtractBitPayUriAddress,
  ExtractUriAmount,
} from '../../../store/wallet/utils/decode-uri';
import {Effect, RootState} from '../../../store';
import {
  createWalletAddress,
  GetCoinAndNetwork,
  TranslateToBchCashAddress,
} from '../../../store/wallet/effects/address/address';
import {APP_NAME_UPPERCASE} from '../../../constants/config';
import {BchLegacyAddressInfo, Mismatch} from '../components/ErrorMessages';
import {Caution, NeutralSlate, Slate30} from '../../../styles/colors';
import {
  BuildKeyWalletRow,
  ContactTitle,
  ContactTitleContainer,
} from './send/SendTo';
import {LogActions} from '../../../store/log';
import ContactsSvg from '../../../../assets/img/tab-icons/contacts.svg';
import ContactRow from '../../../components/list/ContactRow';

const ValidDataTypes: string[] = [
  'BitcoinAddress',
  'BitcoinCashAddress',
  'DogecoinAddress',
  'LitecoinAddress',
  'BitcoinUri',
  'BitcoinCashUri',
  'DogecoinUri',
  'LitecoinUri',
];

const CtaContainer = styled(_CtaContainer)`
  padding: 10px 16px;
`;

const ErrorText = styled(BaseText)`
  color: ${Caution};
  font-size: 12px;
  font-weight: 500;
  padding: 5px 0 0 0;
`;

const CloseButton = styled.Pressable`
  margin-left: ${ScreenGutter};
  cursor: pointer;
`;

export type SendToOptionsParamList = {
  title: string;
  wallet: Wallet;
  context: string;
};

const ScrollViewContainer = styled.ScrollView`
  margin-left: ${ScreenGutter};
`;

const RecipientListContainer = styled.View`
  margin-top: 10px;
  margin-bottom: 25px;
  padding: 0 ${ScreenGutter};
  max-height: 150px;
  min-height: 35px;
`;

export const RecipientRowContainer = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  height: 55px;
`;

export const RecipientContainer = styled.View`
  flex-direction: row;
  flex: 1;
`;

const RecipientOptionsContainer = styled.View`
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

interface RecipientListProps {
  recipient: Recipient;
  wallet: Wallet;
  deleteRecipient: () => void;
  setAmount: () => void;
  context: string;
}

const SendToAddressContainer = styled.View`
  margin-top: 20px;
  padding: 0 15px;
`;

export const RecipientList: React.FC<RecipientListProps> = ({
  recipient,
  wallet,
  deleteRecipient,
  setAmount,
  context,
}) => {
  let recipientData: TxDetailsSendingTo;

  if (recipient?.type === 'contact') {
    recipientData = {
      recipientName: recipient?.name,
      recipientAddress: recipient?.address,
      img: recipient?.type,
    };
  } else {
    recipientData = {
      recipientName: recipient.name,
      recipientAddress: recipient.address,
      img: wallet?.img || wallet?.currencyAbbreviation,
    };
  }

  return (
    <>
      <RecipientRowContainer>
        <RecipientContainer>
          {recipientData.img && (
            <CurrencyImage img={recipientData.img} size={20} />
          )}
          <H7
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{marginLeft: 8, width: '60%'}}>
            {recipientData.recipientName || recipientData.recipientAddress}
          </H7>
        </RecipientContainer>
        <RecipientOptionsContainer>
          {context === 'multisend' ? (
            <TouchableOpacity
              activeOpacity={ActiveOpacity}
              onPress={() => {
                setAmount();
              }}>
              <H5>
                {recipient.amount +
                  ' ' +
                  wallet.currencyAbbreviation.toUpperCase()}
              </H5>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={{marginLeft: 8}}
            activeOpacity={ActiveOpacity}
            onPress={() => deleteRecipient()}>
            <WalletIcons.Delete />
          </TouchableOpacity>
        </RecipientOptionsContainer>
      </RecipientRowContainer>
      <Hr />
    </>
  );
};

interface SendToOptionsContextProps {
  recipientList: Recipient[];
  setRecipientListContext: (
    recipient: Recipient,
    index?: number,
    removeRecipient?: boolean,
    updateRecipient?: boolean,
    amount?: number,
  ) => void;
  setRecipientAmountContext: (
    recipient: Recipient,
    index?: number,
    updateRecipient?: boolean,
  ) => void;
  goToConfirmView: () => void;
  goToSelectInputsView: (recipient: Recipient) => void;
}

export const SendToOptionsContext =
  React.createContext<SendToOptionsContextProps>(
    {} as SendToOptionsContextProps,
  );

const SendToOptions = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const placeHolderTextColor = theme.dark ? NeutralSlate : Slate30;
  const {params} = useRoute<RouteProp<WalletStackParamList, 'SendToOptions'>>();
  const {wallet, context} = params;
  const {currencyAbbreviation, id, network, chain} = wallet;
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientList, setRecipientList] = useState<Recipient[]>([]);
  const [recipientAmount, setRecipientAmount] = useState<{
    showModal: boolean;
    recipient?: Recipient;
    index?: number;
    updateRecipient?: boolean;
  }>({showModal: false});
  const allContacts = useAppSelector(({CONTACT}: RootState) => CONTACT.list);
  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);
  const {keys} = useAppSelector(({WALLET}: RootState) => WALLET);
  const {rates} = useAppSelector(({RATE}) => RATE);
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
        contact.network === network &&
        (contact.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchInput.toLowerCase())),
    );
  }, [allContacts, searchInput, network, currencyAbbreviation]);

  const setRecipientListContext = (
    recipient: Recipient,
    index?: number,
    removeRecipient?: boolean,
    updateRecipient?: boolean,
  ) => {
    let newRecipientList: Recipient[] = _.cloneDeep(recipientList);
    if (removeRecipient) {
      newRecipientList.splice(index!, 1);
    } else if (updateRecipient) {
      newRecipientList[index!] = recipient;
    } else {
      newRecipientList = [...newRecipientList, recipient];
    }

    setRecipientList(newRecipientList);
  };

  const setRecipientAmountContext = (
    recipient: Recipient,
    index?: number,
    updateRecipient?: boolean,
  ) => {
    if (recipient.amount && !updateRecipient) {
      setRecipientListContext(recipient);
    } else {
      setRecipientAmount({showModal: true, recipient, index, updateRecipient});
    }
  };

  const goToConfirmView = async () => {
    try {
      dispatch(startOnGoingProcessModal('LOADING'));
      const amount = _.sumBy(recipientList, 'amount');
      const tx = {
        wallet,
        recipient: recipientList[0],
        recipientList,
        amount,
        context: 'multisend' as TransactionOptionsContext,
      };
      const {txDetails, txp} = (await dispatch<any>(
        createProposalAndBuildTxDetails(tx),
      )) as any;
      dispatch(dismissOnGoingProcessModal());
      navigation.navigate('Wallet', {
        screen: 'Confirm',
        params: {
          wallet,
          recipient: recipientList[0],
          recipientList,
          txp,
          txDetails,
          amount,
        },
      });
    } catch (err: any) {
      const [errorMessageConfig] = await dispatch(
        handleCreateTxProposalError(err),
      );
      dispatch(dismissOnGoingProcessModal());
      dispatch(
        showBottomNotificationModal({
          ...errorMessageConfig,
          enableBackdropDismiss: false,
          actions: [
            {
              text: t('OK'),
              action: () => {},
            },
          ],
        }),
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle>{params.title}</HeaderTitle>,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <CloseButton
          onPress={() => {
            if (recipientAmount.showModal) {
              setRecipientAmount({showModal: false});
            } else {
              navigation.goBack();
            }
          }}>
          <Back opacity={1} />
        </CloseButton>
      ),
    });
  }, [navigation, t, params.title, recipientAmount.showModal]);

  const goToSelectInputsView = (recipient: Recipient) => {
    navigation.navigate('Wallet', {
      screen: 'SelectInputs',
      params: {
        recipient,
        wallet,
      },
    });
  };

  const BchLegacyAddressInfoDismiss = (searchText: string) => {
    try {
      const cashAddr = TranslateToBchCashAddress(
        searchText.replace(/^(bitcoincash:|bchtest:)/, ''),
      );
      setSearchInput(cashAddr);
      validateData(cashAddr);
    } catch (error) {
      dispatch(showBottomNotificationModal(Mismatch(onErrorMessageDismiss)));
    }
  };

  const onErrorMessageDismiss = () => {
    setSearchInput('');
  };

  const checkCoinAndNetwork =
    (data: any): Effect<boolean> =>
    dispatch => {
      const addrData = GetCoinAndNetwork(data, network, chain);
      const isValid =
        chain === addrData?.coin.toLowerCase() && addrData?.network === network;

      if (isValid) {
        return true;
      } else {
        // @ts-ignore
        if (currencyAbbreviation === 'bch' && network === addrData?.network) {
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

  const validateData = async (text: string) => {
    const data = ValidateURI(text);
    if (ValidDataTypes.includes(data?.type)) {
      if (dispatch(checkCoinAndNetwork(text))) {
        setErrorMessage('');
        setSearchInput('');
        const extractedAmount = ExtractUriAmount(data.data);
        const addr = ExtractBitPayUriAddress(text);
        context === 'selectInputs'
          ? goToSelectInputsView({address: addr})
          : addRecipient({
              address: addr,
              amount: extractedAmount ? Number(extractedAmount[1]) : undefined,
            });
      }
    } else {
      setErrorMessage(text.length > 15 ? 'Invalid Address' : '');
    }
  };

  const addRecipient = (newRecipient: Recipient) => {
    setRecipientAmountContext(newRecipient);
  };

  const onSearchInputChange = debounce((text: string) => {
    validateData(text);
  }, 300);

  const onSendToWallet = async (selectedWallet: KeyWallet) => {
    try {
      const {
        credentials,
        id: walletId,
        keyId,
        walletName,
        receiveAddress,
      } = selectedWallet;

      let address = receiveAddress;

      if (!address) {
        dispatch(startOnGoingProcessModal('GENERATING_ADDRESS'));
        address = (await dispatch<any>(
          createWalletAddress({wallet: selectedWallet, newAddress: false}),
        )) as string;
        dispatch(dismissOnGoingProcessModal());
      }

      const newRecipient = {
        type: 'wallet',
        name: walletName || credentials.walletName,
        walletId,
        keyId,
        address,
      };

      context === 'selectInputs'
        ? goToSelectInputsView(newRecipient)
        : addRecipient(newRecipient);
    } catch (err) {
      const e = err instanceof Error ? err.message : JSON.stringify(err);
      dispatch(LogActions.error('[SendToWallet] ', e));
    }
  };

  const renderItem = useCallback(
    ({item, index}) => {
      return (
        <RecipientList
          recipient={item}
          wallet={wallet}
          deleteRecipient={() => setRecipientListContext(item, index, true)}
          setAmount={() => setRecipientAmountContext(item, index, true)}
          context={context}
        />
      );
    },
    [wallet, setRecipientListContext, setRecipientAmountContext],
  );

  return (
    <SendToOptionsContext.Provider
      value={{
        recipientList,
        setRecipientListContext,
        setRecipientAmountContext,
        goToConfirmView,
        goToSelectInputsView,
      }}>
      <RecipientListContainer>
        <H5>
          {recipientList?.length > 1
            ? t('Recipients') + ` (${recipientList?.length})`
            : t('Recipient')}
        </H5>
        {recipientList && recipientList.length ? (
          <View>
            <FlatList
              data={recipientList}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({item, index}: {item: Recipient; index: number}) =>
                renderItem({item, index})
              }
            />
          </View>
        ) : (
          <>
            <RecipientRowContainer>
              <SubText>
                {t(
                  'To get started, you’ll need to enter a valid address or select an existing contact or wallet.',
                )}
              </SubText>
            </RecipientRowContainer>
            <Hr />
          </>
        )}
      </RecipientListContainer>
      <SendToAddressContainer>
        <SearchContainer style={{marginBottom: 0}}>
          <SearchInput
            placeholder={t('Enter address or select wallet')}
            placeholderTextColor={placeHolderTextColor}
            value={searchInput}
            onChangeText={(text: string) => {
              setSearchInput(text);
              onSearchInputChange(text);
            }}
          />
        </SearchContainer>
        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </SendToAddressContainer>
      <ScrollViewContainer>
        <View style={{marginTop: 10}}>
          <KeyWalletsRow
            keyWallets={keyWallets}
            hideBalance={hideAllBalances}
            onPress={(selectedWallet: KeyWallet) => {
              onSendToWallet(selectedWallet);
            }}
          />
          {contacts.length > 0 ? (
            <ContactTitleContainer>
              {ContactsSvg({})}
              <ContactTitle>{'Contacts'}</ContactTitle>
            </ContactTitleContainer>
          ) : null}
          {contacts.length > 0
            ? contacts.map((item, index) => {
                return (
                  <View key={index}>
                    <ContactRow
                      contact={item}
                      onPress={() => {
                        context === 'selectInputs'
                          ? goToSelectInputsView({...item, type: 'contact'})
                          : setRecipientAmountContext({
                              ...item,
                              type: 'contact',
                            });
                      }}
                    />
                  </View>
                );
              })
            : null}
        </View>
      </ScrollViewContainer>

      {context !== 'selectInputs' ? (
        <CtaContainer>
          <Button
            buttonStyle={'primary'}
            onPress={() => {
              goToConfirmView();
            }}
            disabled={!recipientList[0]}>
            {t('Continue')}
          </Button>
        </CtaContainer>
      ) : null}

      <AmountModal
        modalTitle={params.title}
        isVisible={recipientAmount.showModal}
        cryptoCurrencyAbbreviation={params.wallet.currencyAbbreviation.toUpperCase()}
        chain={params.wallet.chain}
        onClose={() => {
          setRecipientAmount({showModal: false});
        }}
        onSubmit={amount => {
          setRecipientAmount({showModal: false});
          setRecipientListContext(
            {...recipientAmount.recipient!, amount},
            recipientAmount.index,
            false,
            recipientAmount.updateRecipient,
          );
        }}
      />
    </SendToOptionsContext.Provider>
  );
};

export default SendToOptions;
