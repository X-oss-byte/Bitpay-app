import i18n from 'i18next';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '../../../../../components/checkbox/Checkbox';
import {
  Hr,
  Setting,
  SettingTitle,
} from '../../../../../components/styled/Containers';
import {AppActions} from '../../../../../store/app';
import {useAppDispatch, useAppSelector} from '../../../../../utils/hooks';
import {Settings, SettingsContainer} from '../../SettingsRoot';
import {LanguageList} from '../../../../../constants/LanguageSelectionList';
import {useNavigation} from '@react-navigation/native';

const LanguageSettingsScreen: React.VFC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const appLanguage = useAppSelector(({APP}) => APP.defaultLanguage);
  const [selected, setSelected] = useState(appLanguage);

  const setLng = (isoCode: string) => {
    setSelected(isoCode);
  };

  useEffect(() => {
    if (selected !== appLanguage) {
      dispatch(AppActions.setDefaultLanguage(selected));
      i18n.changeLanguage(selected).then(() => {
        navigation.goBack();
      });
    }
  }, [dispatch, selected, appLanguage, navigation]);

  return (
    <SettingsContainer>
      <Settings>
        {LanguageList.map(({name, isoCode}) => {
          return (
            <View key={isoCode}>
              <Setting onPress={() => setLng(isoCode)}>
                <SettingTitle>{name}</SettingTitle>
                <Checkbox
                  radio={true}
                  onPress={() => setLng(isoCode)}
                  checked={selected === isoCode}
                />
              </Setting>
              <Hr />
            </View>
          );
        })}
      </Settings>
    </SettingsContainer>
  );
};

export default LanguageSettingsScreen;
