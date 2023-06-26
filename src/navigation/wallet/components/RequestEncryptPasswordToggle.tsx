import {AppActions} from '../../../store/app';
import ToggleSwitch from '../../../components/toggle-switch/ToggleSwitch';
import React, {useEffect, useState} from 'react';
import {Key} from '../../../store/wallet/wallet.models';
import {useNavigation} from '@react-navigation/native';
import {
  dismissBottomNotificationModal,
  showBottomNotificationModal,
} from '../../../store/app/app.actions';
import {WalletActions} from '../../../store/wallet';
import {useLogger} from '../../../utils/hooks/useLogger';
import {DecryptError, WrongPasswordError} from './ErrorMessages';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from '../../../utils/hooks';

const RequestEncryptPasswordToggle = ({currentKey: key}: {currentKey: Key}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const logger = useLogger();

  const [passwordToggle, setPasswordToggle] = useState(
    !!key.methods!.isPrivKeyEncrypted(),
  );

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setPasswordToggle(!!key.methods!.isPrivKeyEncrypted());
    });
  }, [navigation, key.methods]);

  const onSubmitPassword = async (password: string) => {
    if (key) {
      try {
        key.methods!.decrypt(password);
        logger.debug('Key Decrypted');
        dispatch(
          WalletActions.successEncryptOrDecryptPassword({
            key,
          }),
        );
        setPasswordToggle(false);
        dispatch(AppActions.dismissDecryptPasswordModal());
        dispatch(
          showBottomNotificationModal({
            type: 'success',
            title: t('Password removed'),
            message: t(
              'Your encryption password has been removed. This key is now decrypted.',
            ),
            enableBackdropDismiss: true,
            actions: [
              {
                text: t('GOT IT'),
                action: () => {
                  dispatch(dismissBottomNotificationModal());
                },
                primary: true,
              },
            ],
          }),
        );
      } catch (e) {
        console.log(`Decrypt Error: ${e}`);
        dispatch(AppActions.dismissDecryptPasswordModal());
        dispatch(showBottomNotificationModal(WrongPasswordError()));
      }
    } else {
      dispatch(AppActions.dismissDecryptPasswordModal());
      dispatch(showBottomNotificationModal(DecryptError()));
      logger.debug('Missing Key Error');
    }
  };

  return (
    <ToggleSwitch
      onChange={() => {
        if (!passwordToggle) {
          navigation.navigate('Wallet', {
            screen: 'CreateEncryptPassword',
            params: {key},
          });
        } else {
          dispatch(
            AppActions.showDecryptPasswordModal({
              onSubmitHandler: onSubmitPassword,
              description: t(
                'To disable encryption for your wallet, please enter your encryption password below.',
              ),
            }),
          );
        }
      }}
      isEnabled={passwordToggle}
    />
  );
};

export default RequestEncryptPasswordToggle;
