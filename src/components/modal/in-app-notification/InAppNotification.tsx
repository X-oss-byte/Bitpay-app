import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Action, Air, LightBlack, SlateDark} from '../../../styles/colors';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {BaseText} from '../../styled/Text';
import WalletConnectIcon from '../../../../assets/img/wallet-connect/wallet-connect-icon.svg';
import {dismissInAppNotification} from '../../../store/app/app.actions';
import CloseModal from '../../../../assets/img/close-modal-icon.svg';
import {useNavigation} from '@react-navigation/native';
import {getWalletByRequest} from '../../../store/wallet-connect-v2/wallet-connect-v2.effects';
import {sleep} from '../../../utils/helper-methods';
import {TouchableOpacity} from 'react-native';

export type InAppNotificationMessages = 'NEW_PENDING_REQUEST';

const InAppContainer = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Row = styled.View`
  background-color: ${({theme}) => (theme.dark ? LightBlack : Action)};
  border-radius: 10px;
  flex-direction: row;
  padding: 15px;
`;

const WalletConnectIconContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  transform: scale(1.1);
`;

const Message = styled(BaseText)`
  font-weight: 700;
  flex-wrap: wrap;
  color: white;
  margin-right: 15px;
`;

const CloseModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: flex-end;
`;
const CloseModalButton = styled.TouchableOpacity``;

const MessageContainer = styled.View`
  flex-direction: row;
`;

const InAppNotification: React.FC = () => {
  const {dark} = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isVisible = useAppSelector(({APP}) => APP.showInAppNotification);
  const appWasInit = useAppSelector(({APP}) => APP.appWasInit);
  const inAppNotificationData = useAppSelector(
    ({APP}) => APP.inAppNotificationData,
  );
  const {context, message, request} = inAppNotificationData || {};

  const onBackdropPress = () => {
    dispatch(dismissInAppNotification());
  };

  const goToNextView = () => {
    if (context === 'notification') {
      goToWalletConnectRequestDetails();
    }
  };

  const goToWalletConnectRequestDetails = async () => {
    dispatch(dismissInAppNotification());

    await sleep(0);

    const wallet = request && dispatch(getWalletByRequest(request));
    if (!wallet) {
      return;
    }

    navigation.navigate('WalletConnect', {
      screen: 'WalletConnectHome',
      params: {
        topic: request?.topic,
        wallet,
        context: 'notification',
      },
    });
  };

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
              alignSelf: 'center',
              zIndex: true ? 100000 : undefined,
              marginHorizontal: 10,
              paddingVertical: 10,
              display: 'flex',
              flexDirection: 'row',
              borderRadius: 10,
              shadowRadius: 3,
              shadowColor: dark ? Air : SlateDark,
              shadowOpacity: 1,
            }}>
            <InAppContainer onPress={goToNextView} activeOpacity={1}>
              <Row>
                <MessageContainer>
                  {context === 'notification' ? (
                    <WalletConnectIconContainer>
                      <WalletConnectIcon width={20} height={20} />
                    </WalletConnectIconContainer>
                  ) : null}
                  <Message>{message}</Message>
                </MessageContainer>
                <CloseModalContainer>
                  <CloseModalButton onPress={onBackdropPress}>
                    <CloseModal width={20} height={20} />
                  </CloseModalButton>
                </CloseModalContainer>
              </Row>
            </InAppContainer>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}
    </>
  );
};

export default InAppNotification;
