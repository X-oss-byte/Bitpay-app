import React, {ReactNode} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Action, White} from '../../../../styles/colors';
import {BaseText} from '../../../../components/styled/Text';
import {titleCasing} from '../../../../utils/helper-methods';
import {ActiveOpacity} from '../../../../components/styled/Containers';
import {Path, Svg} from 'react-native-svg';
import {useTranslation} from 'react-i18next';

const ButtonsRow = styled.View`
  justify-content: center;
  flex-direction: row;
  align-self: center;
`;

const ButtonContainer = styled.View`
  align-items: center;
  margin: 0 16px;
`;

const ButtonText = styled(BaseText)`
  font-size: 12px;
  line-height: 18px;
  color: ${({theme: {dark}}) => (dark ? White : Action)};
  margin-top: 5px;
`;

const LinkButton = styled.TouchableOpacity`
  height: 43px;
  width: 43px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
  background: ${({theme: {dark}}) => (dark ? '#0C204E' : Action)};
  margin: 11px 0 8px;
  cursor: pointer;
`;

const ReceiveSvg = () => {
  const theme = useTheme();
  return (
    <Svg width="13" height="17" viewBox="0 0 13 17" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.86536 12.7592L10.4752 10.1493C10.9423 9.68222 11.6997 9.68222 12.1668 10.1493C12.6339 10.6164 12.6339 11.3738 12.1668 11.8409L7.52223 16.4855C7.49556 16.5126 7.46761 16.5385 7.43848 16.5629C7.35839 16.6304 7.27154 16.6856 7.18038 16.7287C7.02539 16.802 6.8521 16.8431 6.66924 16.8431C6.49542 16.8431 6.33026 16.806 6.18124 16.7393C6.0654 16.6876 5.95609 16.6166 5.85822 16.5261C5.84522 16.5142 5.8325 16.5019 5.82004 16.4893L1.17162 11.8409C0.704511 11.3738 0.704511 10.6164 1.17162 10.1493C1.63874 9.68222 2.39608 9.68222 2.86319 10.1493L5.47312 12.7593V1.69154C5.47312 1.03094 6.00864 0.495422 6.66924 0.495422C7.32984 0.495422 7.86535 1.03094 7.86536 1.69154V12.7592Z"
        fill={theme.dark ? '#4989FF' : White}
      />
    </Svg>
  );
};

const SendSvg = () => {
  const theme = useTheme();
  return (
    <Svg width="13" height="17" viewBox="0 0 13 17" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.47327 4.57932L2.86339 7.1892C2.39627 7.65631 1.63893 7.65631 1.17182 7.1892C0.704706 6.72209 0.704706 5.96475 1.17182 5.49763L5.81631 0.853139C5.84375 0.825228 5.87254 0.798659 5.90259 0.773535C5.98103 0.707867 6.0659 0.653832 6.15494 0.611428C6.31077 0.537076 6.48522 0.495453 6.66938 0.495453C6.8432 0.495453 7.00836 0.532528 7.15738 0.599202C7.27322 0.650919 7.38253 0.721983 7.4804 0.812388C7.4934 0.824381 7.50613 0.836661 7.51858 0.849213L12.167 5.49763C12.6341 5.96475 12.6341 6.72208 12.167 7.1892C11.6999 7.65631 10.9425 7.65631 10.4754 7.1892L7.8655 4.57927L7.8655 15.647C7.8655 16.3076 7.32998 16.8431 6.66938 16.8431C6.00879 16.8431 5.47327 16.3076 5.47327 15.647L5.47327 4.57932Z"
        fill={theme.dark ? '#4989FF' : White}
      />
    </Svg>
  );
};

interface ButtonListProps {
  label: string;
  img: ReactNode;
  cta: () => void;
  hide: boolean;
}

interface Props {
  send: {
    label?: string;
    hide?: boolean;
    cta: () => void;
  };
  receive: {
    label?: string;
    hide?: boolean;
    cta: () => void;
  };
  buy?: {
    hide?: boolean;
    cta: () => void;
  };
  swap?: {
    hide?: boolean;
    cta: () => void;
  };
}

const LinkingButtons = ({receive, send}: Props) => {
  const {t} = useTranslation();
  const buttonsList: Array<ButtonListProps> = [
    {
      label: receive.label || t('receive'),
      img: <ReceiveSvg />,
      cta: receive.cta,
      hide: !!receive?.hide,
    },
    {
      label: send.label || t('send'),
      img: <SendSvg />,
      cta: send.cta,
      hide: !!send?.hide,
    },
  ];
  return (
    <ButtonsRow>
      {buttonsList.map(({label, cta, img, hide}: ButtonListProps) =>
        hide ? null : (
          <ButtonContainer key={label}>
            <LinkButton
              activeOpacity={ActiveOpacity}
              onPress={() => {
                cta();
              }}>
              {img}
            </LinkButton>
            <ButtonText>{titleCasing(label)}</ButtonText>
          </ButtonContainer>
        ),
      )}
    </ButtonsRow>
  );
};

export default LinkingButtons;
