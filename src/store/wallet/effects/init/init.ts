import {Effect, RootState} from '../../../index';
import {WalletActions} from '../../index';
import {getPriceHistory, startGetRates} from '../rates/rates';
import {startGetTokenOptions} from '../currencies/currencies';
import {startUpdateAllKeyAndWalletStatus} from '../status/status';
import {LogActions} from '../../../log';
import {
  dismissOnGoingProcessModal,
  showOnGoingProcessModal,
} from '../../../app/app.actions';

export const startWalletStoreInit =
  (): Effect<Promise<void>> => async (dispatch, getState: () => RootState) => {
    dispatch(LogActions.info('starting [startWalletStoreInit]'));
    try {
      dispatch(showOnGoingProcessModal('LOADING'));
      const {WALLET, APP} = getState();
      const defaultAltCurrencyIsoCode = APP.defaultAltCurrency.isoCode;

      // both needed for startUpdateAllKeyAndWalletStatus
      await dispatch(startGetTokenOptions()); // needed for getRates. Get more recent 1inch tokens list
      await dispatch(startGetRates({init: true})); // populate rates and alternative currency list

      if (Object.keys(WALLET.keys).length) {
        dispatch(startUpdateAllKeyAndWalletStatus({}));
      }

      dispatch(getPriceHistory(defaultAltCurrencyIsoCode));
      dispatch(WalletActions.successWalletStoreInit());
      dispatch(LogActions.info('success [startWalletStoreInit]'));
      dispatch(dismissOnGoingProcessModal());
    } catch (e) {
      let errorStr;
      if (e instanceof Error) {
        errorStr = e.message;
      } else {
        errorStr = JSON.stringify(e);
      }
      dispatch(WalletActions.failedWalletStoreInit());
      dispatch(LogActions.error(`failed [startWalletStoreInit]: ${errorStr}`));
      dispatch(dismissOnGoingProcessModal());
    }
  };
