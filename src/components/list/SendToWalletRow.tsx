import React from 'react';
import {BaseText, H5, H7} from '../styled/Text';
import {SendToWalletRowProps} from '../../navigation/wallet/screens/send/SendTo';
import styled from 'styled-components/native';
import KeySvg from '../../../assets/img/key.svg';
import {LightBlack, SlateDark, White} from '../../styles/colors';
import {CurrencyImage} from '../currency-image/CurrencyImage';
import {Column} from '../styled/Containers';

const RowContainer = styled.View`
  margin: 20px 0;
`;

const KeyNameContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-color: ${({theme: {dark}}) => (dark ? LightBlack : '#ECEFFD')};
  border-bottom-width: 1px;
  padding-bottom: 15px;
  margin-bottom: 15px;
`;

const KeyName = styled(BaseText)`
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
  margin-left: 10px;
`;

interface Props {
  wallet: SendToWalletRowProps;
  onPress: () => void;
}

const CurrencyRow = styled.View`
  flex-direction: row;
`;

const CurrencyColumn = styled.View`
  margin-left: 10px;
  justify-content: center;
`;

const DetailsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BalanceColumn = styled(Column)`
  align-items: flex-end;
`;

const SubText = styled(H7)`
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
`;

const SendToWalletRow = ({wallet, onPress}: Props) => {
  const {
    img,
    cryptoBalance,
    currencyAbbreviation,
    currencyName,
    keyName,
    fiatBalance,
  } = wallet;

  return (
    <RowContainer>
      <KeyNameContainer>
        <KeySvg />
        <KeyName>{keyName}</KeyName>
      </KeyNameContainer>

      <DetailsRow>
        <CurrencyRow>
          <CurrencyImage img={img} size={50} />

          <CurrencyColumn>
            <H5 ellipsizeMode="tail" numberOfLines={1}>
              {currencyName}
            </H5>
            <SubText>{currencyAbbreviation}</SubText>
          </CurrencyColumn>
        </CurrencyRow>

        <BalanceColumn>
          <H5>{cryptoBalance}</H5>
          <SubText>{fiatBalance}</SubText>
        </BalanceColumn>
      </DetailsRow>
    </RowContainer>
  );
};

export default SendToWalletRow;
