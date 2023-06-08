import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {memo, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, SectionList, Linking} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {
  SheetContainer,
  SheetParams,
} from '../../../../../components/styled/Containers';
import {BaseText} from '../../../../../components/styled/Text';
import {APP_VERSION} from '../../../../../constants/config';
import {LogActions} from '../../../../../store/log';
import {LogEntry, LogLevel} from '../../../../../store/log/log.models';
import {
  Action,
  Caution,
  LinkBlue,
  SlateDark,
  Warning,
  White,
  Slate,
  Black,
  NeutralSlate,
  LightBlack,
} from '../../../../../styles/colors';
import {useAppDispatch, useAppSelector} from '../../../../../utils/hooks';
import {AboutStackParamList} from '../AboutStack';
import Settings from '../../../../../components/settings/Settings';
import SheetModal from '../../../../../components/modal/base/sheet/SheetModal';
import SendIcon from '../../../../../../assets/img/send-icon.svg';
import SendIconWhite from '../../../../../../assets/img/send-icon-white.svg';

export interface SessionLogsParamList {}

type SessionLogsScreenProps = StackNavigationProp<
  AboutStackParamList,
  'SessionLogs'
>;

const LogsContainer = styled.SafeAreaView`
  flex: 1;
`;

const Logs = styled(BaseText)<{color?: string | null}>`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: ${({theme: {dark}, color}) =>
    color ? color : dark ? White : SlateDark};
`;

const LogsMessage = styled.Text`
  font-weight: 400;
`;

const FilterLabelsContainer = styled.View`
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: ${({theme: {dark}}) => (dark ? LightBlack : NeutralSlate)};
`;

const FilterLabel = styled(BaseText)<{
  color?: string | null;
  isSelected: boolean;
}>`
  flex: 1 1 100%;
  padding: 20px 0px;
  text-align: center;
  color: ${({theme: {dark}, color, isSelected}) =>
    color && isSelected ? color : dark ? White : SlateDark};
`;

const OptionContainer = styled.TouchableOpacity<SheetParams>`
  flex-direction: row;
  align-items: stretch;
  padding-${({placement}) => placement}: 31px;
`;

const OptionTextContainer = styled.View`
  align-items: flex-start;
  justify-content: space-around;
  flex-direction: column;
  margin: 0 20px;
`;

const OptionTitleText = styled(BaseText)`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 19px;
  color: ${({theme: {dark}}) => (dark ? White : Action)};
`;

const OptionDescriptionText = styled(BaseText)`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
  color: ${({theme: {dark}}) => (dark ? Slate : Black)};
`;

const OptionIconContainer = styled.View`
  justify-content: center;
  width: 20px;
`;

const MIN_LOG_LEVEL = LogLevel.Error;
const MAX_LOG_LEVEL = LogLevel.Debug;

const LogColorMap: Partial<{[key in LogLevel]: string | null}> = {
  [LogLevel.Error]: Caution,
  [LogLevel.Warn]: Warning,
  [LogLevel.Debug]: LinkBlue,
};

const LogLabelColorMap: Partial<{[key in LogLevel]: string | null}> = {
  [LogLevel.Error]: Caution,
  [LogLevel.Warn]: Warning,
  [LogLevel.Debug]: LinkBlue,
  [LogLevel.Info]: LinkBlue,
};

const FilterLabels: React.VFC<{
  onPress?: (level: LogLevel) => any;
  selectedLabel: LogLevel;
}> = memo(props => {
  const levels = [];

  for (let i = MIN_LOG_LEVEL; i <= MAX_LOG_LEVEL; ++i) {
    levels.push(i);
  }

  return (
    <FilterLabelsContainer>
      {levels.map(level => (
        <FilterLabel
          isSelected={props.selectedLabel === level}
          color={LogLabelColorMap[level]}
          onPress={() => props.onPress?.(level)}
          key={level}>
          {LogLevel[level]}
        </FilterLabel>
      ))}
    </FilterLabelsContainer>
  );
});

const renderItem = ({item}: {item: LogEntry}) => (
  <Logs color={LogColorMap[item.level]}>
    [{LogLevel[item.level]}] <LogsMessage>{item.message}</LogsMessage>
  </Logs>
);

const keyExtractor = (item: LogEntry, index: number) => item.message + index;

const SessionLogs: React.VFC<SessionLogsScreenProps> = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [showOptions, setShowOptions] = useState(false);
  const logs = useAppSelector(({LOG}) => LOG.logs);
  const persistedLogs = useAppSelector(({LOG}) => LOG.persistedLogs);
  const [filterLevel, setFilterLevel] = useState(LogLevel.Info);

  const filteredLogs = logs.filter(log => log.level <= filterLevel);
  const currentSessionStartTime = new Date(logs[0].timestamp);
  const filteredPersistedLogs = persistedLogs.filter(
    log =>
      log.level <= filterLevel &&
      new Date(log.timestamp) < currentSessionStartTime,
  );

  const onFilterLevelChange = (level: LogLevel) => {
    if (level !== filterLevel) {
      setFilterLevel(level);
    }
  };

  const handleEmail = (data: string) => {
    Linking.openURL(
      `mailto:?subject=BitPay v${APP_VERSION} Logs&body=${data}`,
    ).catch(error => {
      dispatch(LogActions.error('Error sending email: ' + error));
    });
  };

  const showDisclaimer = () => {
    setShowOptions(false);
    let logStr =
      'Session Logs.\nBe careful, this could contain sensitive private data\n\n';
    const printLogs = (logsToPrint: LogEntry[]) =>
      logsToPrint
        .map(log => {
          const formattedLevel = LogLevel[log.level].toLowerCase();

          return `[${log.timestamp}] [${formattedLevel}] ${log.message}\n`;
        })
        .join('');
    const persistedLogString = filteredPersistedLogs.length
      ? 'Previous Sessions\n\n' +
        printLogs(filteredPersistedLogs) +
        '\n\nCurrent Session\n\n'
      : '';
    logStr += persistedLogString + printLogs(filteredLogs);

    Alert.alert(
      t('Warning'),
      t('Be careful, this could contain sensitive private data'),
      [
        {text: t('Continue'), onPress: () => handleEmail(logStr)},
        {text: t('Cancel')},
      ],
      {cancelable: true},
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Settings onPress={() => setShowOptions(true)} />,
    });
  }, [navigation]);

  return (
    <LogsContainer>
      <SectionList
        contentContainerStyle={{
          paddingBottom: 20,
          marginTop: 15,
          paddingHorizontal: 15,
        }}
        sections={[
          {title: t('Previous Sessions'), data: filteredPersistedLogs},
          {title: t('Current Session'), data: filteredLogs},
        ]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({section: {title}}) =>
          filteredPersistedLogs.length > 0 ? title : null
        }
      />

      <FilterLabels onPress={onFilterLevelChange} selectedLabel={filterLevel} />

      <SheetModal
        placement={'top'}
        isVisible={showOptions}
        onBackdropPress={() => setShowOptions(false)}>
        <SheetContainer placement={'top'}>
          <OptionContainer placement={'top'} onPress={() => showDisclaimer()}>
            <OptionIconContainer>
              {theme.dark ? <SendIconWhite /> : <SendIcon />}
            </OptionIconContainer>
            <OptionTextContainer>
              <OptionTitleText>{t('Send Logs By Email')}</OptionTitleText>
              <OptionDescriptionText>
                {t('Be careful, this could contain sensitive private data')}
              </OptionDescriptionText>
            </OptionTextContainer>
          </OptionContainer>
        </SheetContainer>
      </SheetModal>
    </LogsContainer>
  );
};

export default SessionLogs;
