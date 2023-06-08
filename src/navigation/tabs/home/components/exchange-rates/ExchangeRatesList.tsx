import React, {ReactElement} from 'react';
import styled from 'styled-components/native';
import {ScreenGutter} from '../../../../../components/styled/Containers';
import ExchangeRateItem from './ExchangeRateItem';

export interface ExchangeRateItemProps {
  id: string;
  img: string | ((props: any) => ReactElement);
  currencyName: string;
  chain: string;
  currencyAbbreviation: string;
  average?: number;
  currentPrice?: number;
  priceDisplay: Array<any>;
}

const ExchangeRateListContainer = styled.View`
  margin: 10px ${ScreenGutter} 10px;
`;
interface ExchangeRateProps {
  items: Array<ExchangeRateItemProps>;
  defaultAltCurrencyIsoCode: string;
}

const ExchangeRatesList: React.FC<ExchangeRateProps> = props => {
  const {items, defaultAltCurrencyIsoCode} = props;

  return (
    <ExchangeRateListContainer>
      {items.map(item => (
        <ExchangeRateItem
          item={item}
          key={item.id}
          defaultAltCurrencyIsoCode={defaultAltCurrencyIsoCode}
        />
      ))}
    </ExchangeRateListContainer>
  );
};

export default ExchangeRatesList;
