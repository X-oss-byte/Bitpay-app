import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {useTheme} from 'styled-components/native';
import {Air, NeutralSlate, SlateDark} from '../../../styles/colors';
import {useAppSelector} from '../../../utils/hooks';

export type OnGoingProcessMessages =
  | 'GENERAL_AWAITING'
  | 'CREATING_KEY'
  | 'LOGGING_IN'
  | 'PAIRING'
  | 'CREATING_ACCOUNT'
  | 'UPDATING_ACCOUNT'
  | 'IMPORTING'
  | 'DELETING_KEY'
  | 'ADDING_WALLET'
  | 'LOADING'
  | 'FETCHING_PAYMENT_OPTIONS'
  | 'FETCHING_PAYMENT_INFO'
  | 'JOIN_WALLET'
  | 'SENDING_PAYMENT'
  | 'ACCEPTING_PAYMENT'
  | 'GENERATING_ADDRESS'
  | 'GENERATING_GIFT_CARD'
  | 'SYNCING_WALLETS'
  | 'REJECTING_CALL_REQUEST'
  | 'SAVING_LAYOUT'
  | 'SAVING_ADDRESSES'
  | 'EXCHANGE_GETTING_DATA'
  | 'CALCULATING_FEE'
  | 'CONNECTING_COINBASE'
  | 'FETCHING_COINBASE_DATA'
  | 'UPDATING_TXP'
  | 'CREATING_TXP'
  | 'SENDING_EMAIL'
  | 'REDIRECTING'
  | 'BROADCASTING_TXP';

const OnGoingProcessModal: React.FC = () => {
  const {dark} = useTheme();
  const message = useAppSelector(({APP}) => APP.onGoingProcessModalMessage);
  const isVisible = useAppSelector(({APP}) => APP.showOnGoingProcessModal);
  const appWasInit = useAppSelector(({APP}) => APP.appWasInit);

  return (
    <>
      {appWasInit && isVisible ? (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: 'absolute',
              bottom: '50%',
              alignSelf: 'center',
              zIndex: true ? 1000000 : undefined,
              backgroundColor: dark ? SlateDark : Air,
              paddingHorizontal: 10,
              paddingVertical: 20,
              display: 'flex',
              flexDirection: 'row',
              borderRadius: 10,
              shadowRadius: 3,
              shadowColor: dark ? Air : SlateDark,
              shadowOpacity: 1,
            }}>
            <ActivityIndicator
              color={dark ? NeutralSlate : SlateDark}
              style={{marginRight: 10}}></ActivityIndicator>
            <Text style={{color: dark ? NeutralSlate : SlateDark}}>
              {message}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}
    </>
  );
};

export default OnGoingProcessModal;
