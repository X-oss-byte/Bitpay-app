import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Paragraph} from '../../../../../components/styled/Text';
import {SlateDark, White} from '../../../../../styles/colors';
import {useTranslation} from 'react-i18next';
import * as yup from 'yup';
import {Controller, useForm} from 'react-hook-form';
import BoxInput from '../../../../../components/form/BoxInput';
import {yupResolver} from '@hookform/resolvers/yup';
import Checkbox from '../../../../../components/checkbox/Checkbox';
import Button from '../../../../../components/button/Button';
import {useAppDispatch, useAppSelector} from '../../../../../utils/hooks';
import {setEmailNotifications} from '../../../../../store/app/app.effects';
import {Settings, SettingsContainer} from '../../SettingsRoot';
import {
  Hr,
  ScreenGutter,
  Setting,
  SettingTitle,
  SettingDescription,
} from '../../../../../components/styled/Containers';
import {useNavigation} from '@react-navigation/native';

const EmailNotificationsContainer = styled.SafeAreaView`
  flex: 1;
`;

const ScrollView = styled.ScrollView`
  padding: 0 8px;
  margin-left: ${ScreenGutter};
`;

const EmailNotificationsParagraph = styled(Paragraph)`
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
  margin-bottom: 15px;
`;

const EmailFormContainer = styled.View`
  margin: 15px 0;
`;

const VerticalSpace = styled.View`
  margin: 15px 0;
`;

const AuthRowContainer = styled.View`
  margin-bottom: 12px;
`;

const AuthActionsContainer = styled.View`
  margin-top: 20px;
`;

const AuthActionRow = styled.View`
  margin-bottom: 32px;
`;

const schema = yup.object().shape({
  email: yup.string().email().required(),
});

interface EmailNotificationsFieldValues {
  email: string;
}

const EmailNotifications = () => {
  const {t} = useTranslation();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<EmailNotificationsFieldValues>({resolver: yupResolver(schema)});

  const emailNotifications = useAppSelector(({APP}) => APP.emailNotifications);
  const [notificationsAccepted, setNotificationsAccepted] = useState(
    !!emailNotifications?.accepted,
  );

  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const onSubmit = handleSubmit(formData => {
    const {email} = formData;
    dispatch(setEmailNotifications(true, email));
    setNotificationsAccepted(true);
  });

  const onPress = () => {
    const accepted = !notificationsAccepted;
    dispatch(setEmailNotifications(accepted, null));
    setNotificationsAccepted(accepted);
  };

  const unsubscribeAll = () => {
    dispatch(setEmailNotifications(false, null));
    setNotificationsAccepted(false);
    navigation.goBack();
  };

  return (
    <EmailNotificationsContainer>
      {!notificationsAccepted ? (
        <ScrollView>
          <EmailNotificationsParagraph>
            {t(
              'Provide your email address to receive occasional updates on new features and other relevant news.',
            )}
          </EmailNotificationsParagraph>

          <EmailFormContainer>
            <VerticalSpace>
              <AuthRowContainer>
                <Controller
                  control={control}
                  render={({field: {onChange, onBlur, value}}) => (
                    <BoxInput
                      placeholder={'satoshi@example.com'}
                      label={t('EMAIL')}
                      onBlur={onBlur}
                      onChangeText={(text: string) => onChange(text)}
                      error={errors.email?.message}
                      value={value}
                    />
                  )}
                  name="email"
                  defaultValue=""
                />
              </AuthRowContainer>

              <AuthActionsContainer>
                <AuthActionRow>
                  <Button onPress={onSubmit}>{t('Subscribe')}</Button>
                </AuthActionRow>
              </AuthActionsContainer>
              <Button
                buttonType={'pill'}
                buttonStyle={'secondary'}
                onPress={unsubscribeAll}>
                {t('Unsubscribe all Email Notifications')}
              </Button>
            </VerticalSpace>
          </EmailFormContainer>
        </ScrollView>
      ) : (
        <SettingsContainer>
          <Settings>
            <Setting onPress={onPress}>
              <SettingTitle>{t('Enabled')}</SettingTitle>
              <SettingDescription>
                {emailNotifications.email}
              </SettingDescription>
            </Setting>
            <Hr />
            <Button
              style={{marginTop: 20}}
              buttonType={'pill'}
              buttonStyle={'secondary'}
              onPress={unsubscribeAll}>
              {t('Unsubscribe all Email Notifications')}
            </Button>
          </Settings>
        </SettingsContainer>
      )}
    </EmailNotificationsContainer>
  );
};

export default EmailNotifications;
