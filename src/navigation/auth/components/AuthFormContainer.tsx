import React from 'react';
import styled from 'styled-components/native';
import {BaseText} from '../../../components/styled/Text';
import {SlateDark} from '../../../styles/colors';
import {BitPayTheme} from '../../../themes/bitpay';

interface LoginContainerProps {
  theme?: BitPayTheme;
  header?: string;
}

const LoginContainer = styled.SafeAreaView`
  justify-content: center;
  align-items: center;
`;

const HeaderContainer = styled.View`
  width: 100%;
  padding: 0 20px;
  margin: 25px 0;
`;

interface HeaderTextProps {
  theme?: BitPayTheme;
}

const HeaderText = styled(BaseText)<HeaderTextProps>`
  color: ${({theme}) => theme && theme.colors.text};
  font-size: 25px;
  font-weight: 700;
  line-height: 34px;
`;

const FormContainer = styled.View`
  width: 100%;
  padding: 0 20px;
`;

export const AuthFormParagraph = styled.Text`
  color: ${SlateDark}
  font-size: 16px;
  font-weight: 400;
  line-height: 25px;
`;

export const AuthInputContainer = styled.View`
  margin: 15px 0;
`;

export const AuthActionsContainer = styled.View`
  margin-top: 20px;
`;

const AuthContainer: React.FC<LoginContainerProps> = props => {
  const {children, theme, header} = props;
  return (
    <LoginContainer>
      <HeaderContainer>
        <HeaderText theme={theme}>{header}</HeaderText>
      </HeaderContainer>
      <FormContainer>{children}</FormContainer>
    </LoginContainer>
  );
};

export default AuthContainer;