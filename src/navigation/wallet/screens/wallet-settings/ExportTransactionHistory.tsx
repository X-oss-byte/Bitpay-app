import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components/native';
import Button from '../../../../components/button/Button';
import {ScreenGutter} from '../../../../components/styled/Containers';
import {
  BWS_TX_HISTORY_LIMIT,
  GetTransactionHistory,
} from '../../../../store/wallet/effects/transactions/transactions';
import {useAppDispatch} from '../../../../utils/hooks';
import {WalletStackParamList} from '../../WalletStack';
import _ from 'lodash';
import {APP_NAME_UPPERCASE} from '../../../../constants/config';
import {GetPrecision} from '../../../../store/wallet/utils/currency';
import RNFS from 'react-native-fs';
import Papa from 'papaparse';
import {BottomNotificationConfig} from '../../../../components/modal/bottom-notification/BottomNotification';
import {sleep} from '../../../../utils/helper-methods';
import {
  dismissBottomNotificationModal,
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
} from '../../../../store/app/app.actions';
import {CustomErrorMessage} from '../../components/ErrorMessages';
import {BWCErrorMessage} from '../../../../constants/BWCError';
import {startOnGoingProcessModal} from '../../../../store/app/app.effects';
import {LogActions} from '../../../../store/log';
import {Paragraph} from '../../../../components/styled/Text';
import {SlateDark, White} from '../../../../styles/colors';

const ExportTransactionHistoryContainer = styled.SafeAreaView`
  flex: 1;
`;

const ScrollView = styled.ScrollView`
  padding: 0px 8px;
  margin-left: ${ScreenGutter};
`;

const ExportTransactionHistoryDescription = styled(Paragraph)`
  margin-bottom: 15px;
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
`;

const ButtonContainer = styled.View`
  margin-top: 20px;
`;

const ExportTransactionHistory = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {
    params: {wallet},
  } = useRoute<RouteProp<WalletStackParamList, 'ExportTransactionHistory'>>();
  const {currencyAbbreviation, chain, walletName} = wallet;

  const formatDate = (date: number): string => {
    const dateObj = new Date(date);
    if (!dateObj) {
      dispatch(LogActions.warn('[formatDate]: Error formating a date.'));
      return 'DateError';
    }
    if (!dateObj.toJSON()) {
      return '';
    }
    return dateObj.toJSON();
  };

  const buildCVSFile = async () => {
    try {
      const {transactions} = await dispatch(
        GetTransactionHistory({
          wallet,
          transactionsHistory: [],
          limit: BWS_TX_HISTORY_LIMIT,
        }),
      );

      if (_.isEmpty(transactions)) {
        dispatch(
          LogActions.warn(
            '[buildCVSFile]: Failed to generate CSV: no transactions',
          ),
        );
        const err = t('This wallet has no transactions');
        throw err;
      }

      dispatch(
        LogActions.debug(
          `[buildCVSFile]: Wallet Transaction History Length: ${transactions.length}`,
        ),
      );

      // @ts-ignore
      const {unitToSatoshi} = dispatch(
        GetPrecision(currencyAbbreviation, chain),
      );
      const satToUnit = 1 / unitToSatoshi;

      let _amount, _note, _copayers, _creator, _comment;
      const csvContent: any[] = [];

      transactions.forEach(tx => {
        let amount = tx.amount;

        if (tx.action == 'moved') {
          amount = 0;
        }

        _copayers = '';
        _creator = '';

        if (tx.actions && tx.actions.length > 1) {
          for (let i = 0; i < tx.actions.length; i++) {
            _copayers +=
              tx.actions[i].copayerName + ':' + tx.actions[i].type + ' - ';
          }
          _creator = tx.creatorName ? tx.creatorName : '';
        }
        _amount =
          (tx.action == 'sent' ? '-' : '') + (amount * satToUnit).toFixed(8);
        _note = tx.message || '';
        _comment = tx.note ? tx.note.body : '';

        if (tx.action == 'moved') {
          _note += ' Sent to self:' + (tx.amount * satToUnit).toFixed(8);
        }

        csvContent.push({
          Date: formatDate(tx.time * 1000),
          Destination: tx.addressTo || '',
          Description: _note,
          Amount: _amount,
          Currency: currencyAbbreviation.toUpperCase(),
          Txid: tx.txid,
          Creator: _creator,
          Copayers: _copayers,
          Comment: _comment,
        });

        if (tx.fees && (tx.action == 'moved' || tx.action == 'sent')) {
          const _fee = (tx.fees * satToUnit).toFixed(8);
          csvContent.push({
            Date: formatDate(tx.time * 1000),
            Destination: `${chain.toUpperCase()} Network Fees`,
            Description: _note,
            Amount: '-' + _fee,
            Currency: chain.toUpperCase(),
            Txid: '',
            Creator: '',
            Copayers: '',
          });
        }
      });
      const csv = Papa.unparse(csvContent);
      return csv;
    } catch (e) {
      const errString = e instanceof Error ? e.message : JSON.stringify(e);
      dispatch(LogActions.warn(`[buildCVSFile]: ${errString}`));
      throw e;
    }
  };

  const downloadFile = async () => {
    try {
      await dispatch(startOnGoingProcessModal('LOADING'));
      const csv = await buildCVSFile();
      const csvFilename = `${APP_NAME_UPPERCASE}-${walletName}.csv`;
      const filePath =
        (RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath) +
        '/' +
        csvFilename;
      RNFS.writeFile(filePath, csv)
        .then(() => {
          dispatch(dismissOnGoingProcessModal());
          dispatch(
            showBottomNotificationModal({
              title: t('File downloaded'),
              message: t('Saved file: ') + filePath,
              type: 'success',
              actions: [
                {
                  text: 'OK',
                  action: () => {
                    dispatch(dismissBottomNotificationModal());
                  },
                },
              ],
              enableBackdropDismiss: true,
            }),
          );
        })
        .catch(err => {
          throw err;
        });
    } catch (e) {
      dispatch(dismissOnGoingProcessModal());
      await showErrorMessage(
        CustomErrorMessage({
          errMsg: BWCErrorMessage(e),
          title: t('Uh oh, something went wrong'),
        }),
      );
    }
  };

  const showErrorMessage = useCallback(
    async (msg: BottomNotificationConfig) => {
      await sleep(500);
      dispatch(showBottomNotificationModal(msg));
    },
    [dispatch],
  );

  return (
    <ExportTransactionHistoryContainer>
      <ScrollView>
        <ExportTransactionHistoryDescription>
          {t('Export your transaction history as a .csv file')}
        </ExportTransactionHistoryDescription>
        <ButtonContainer>
          <Button onPress={() => downloadFile()}>{t('Download File')}</Button>
        </ButtonContainer>
      </ScrollView>
    </ExportTransactionHistoryContainer>
  );
};

export default ExportTransactionHistory;
