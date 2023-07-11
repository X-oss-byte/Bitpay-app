import React, {useLayoutEffect} from 'react';
import styled from 'styled-components/native';
import RecoveryPhrase from '../components/RecoveryPhrase';
import FileOrText from '../components/FileOrText';
import {HeaderTitle} from '../../../components/styled/Text';
import {useNavigation} from '@react-navigation/native';
import {WalletStackParamList} from '../WalletStack';
import {StackScreenProps} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import Button from '../../../components/button/Button';

type ImportScreenProps = StackScreenProps<WalletStackParamList, 'Import'>;

export interface ImportParamList {
  context?: string;
  keyId?: string;
  importQrCodeData?: string;
}

const ImportContainer = styled.SafeAreaView`
  flex: 1;
  margin-top: 10px;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

const Import: React.FC<ImportScreenProps> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [importType, setImportType] = React.useState<string>('phrase');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle>{t('Import')}</HeaderTitle>,
      headerTitleAlign: 'center',
    });
  }, [navigation, t]);

  return (
    <ImportContainer accessibilityLabel="import-view">
      <ButtonsContainer>
        <Button
          buttonStyle={importType === 'phrase' ? 'primary' : 'cancel'}
          buttonType={'pill'}
          onPress={() => setImportType('phrase')}>
          Recovery Phrase
        </Button>
        <Button
          buttonStyle={importType === 'file' ? 'primary' : 'cancel'}
          buttonType={'pill'}
          onPress={() => setImportType('file')}>
          Plain Text
        </Button>
      </ButtonsContainer>
      {importType === 'phrase' ? <RecoveryPhrase /> : <FileOrText />}
    </ImportContainer>
  );
};

export default Import;
