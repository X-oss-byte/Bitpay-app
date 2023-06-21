import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import styled from 'styled-components/native';
import AngleRight from '../../../../../assets/img/angle-right.svg';
import WalletConnectIcon from '../../../../../assets/img/wallet-connect/wallet-connect-icon.svg';
import {Setting, SettingTitle} from '../../../../components/styled/Containers';
import {useAppDispatch, useAppSelector} from '../../../../utils/hooks';
import {SettingsComponent} from '../SettingsRoot';

interface ConnectionsProps {
  redirectTo?: string;
}

const ConnectionItemContainer = styled.View`
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  flex: 1;
`;

const ConnectionIconContainer = styled.View`
  margin-right: 5px;
`;

const Connections: React.VFC<ConnectionsProps> = props => {
  const {redirectTo} = props;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const connectors = useAppSelector(
    ({WALLET_CONNECT}) => WALLET_CONNECT.connectors,
  );
  const sessions = useAppSelector(
    ({WALLET_CONNECT_V2}) => WALLET_CONNECT_V2.sessions,
  );

  const goToWalletConnect = useCallback(() => {
    if (Object.keys(sessions).length || Object.keys(connectors).length) {
      navigation.navigate('WalletConnect', {
        screen: 'WalletConnectConnections',
      });
    } else {
      navigation.navigate('WalletConnect', {
        screen: 'Root',
        params: {uri: undefined},
      });
    }
  }, [dispatch, sessions, navigation]);

  useEffect(() => {
    if (redirectTo === 'walletconnect') {
      // reset params to prevent re-triggering
      navigation.setParams({redirectTo: undefined} as any);
      goToWalletConnect();
    }
  }, [redirectTo, goToWalletConnect, navigation]);

  return (
    <SettingsComponent>
      <Setting
        onPress={() => {
          goToWalletConnect();
        }}>
        <ConnectionItemContainer>
          <ConnectionIconContainer>
            <WalletConnectIcon width={30} height={25} />
          </ConnectionIconContainer>
          <SettingTitle>WalletConnect</SettingTitle>
        </ConnectionItemContainer>
        <AngleRight />
      </Setting>
    </SettingsComponent>
  );
};

export default Connections;
