import {Effect} from '../../../index';
import {BwcProvider} from '../../../../lib/bwc';
import merge from 'lodash.merge';
import {
  buildKeyObj,
  buildWalletObj,
  mapAbbreviationAndName,
} from '../../utils/wallet';
import {successCreateKey, successAddWallet} from '../../wallet.actions';
import {Key, KeyOptions, Wallet} from '../../wallet.models';
import {createWalletWithOpts} from '../create/create';
import {LogActions} from '../../../log';

const BWC = BwcProvider.getInstance();

export const startCreateKeyMultisig =
  (opts: Partial<KeyOptions>): Effect =>
  async (dispatch, getState): Promise<Key> => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          WALLET: {keys},
        } = getState();

        const _key = BWC.createKey({
          seedType: 'new',
        });

        const _wallet = await createWalletWithOpts({key: _key, opts});

        const {currencyAbbreviation, currencyName} = dispatch(
          mapAbbreviationAndName(
            _wallet.credentials.coin,
            _wallet.credentials.chain,
          ),
        );

        // build out app specific props
        const wallet = merge(
          _wallet,
          buildWalletObj({
            ..._wallet.credentials,
            currencyAbbreviation,
            currencyName,
          }),
        ) as Wallet;

        const key = buildKeyObj({key: _key, wallets: [wallet]});
        const previousKeysLength = Object.keys(keys).length;
        const numNewKeys = Object.keys(keys).length + 1;
        const lengthChange = previousKeysLength - numNewKeys;
        dispatch(
          successCreateKey({
            key,
            lengthChange,
          }),
        );
        resolve(key);
      } catch (err) {
        const errorStr =
          err instanceof Error ? err.message : JSON.stringify(err);
        dispatch(LogActions.error(`Error create key multisig: ${errorStr}`));
        reject();
      }
    });
  };

export const addWalletMultisig =
  ({key, opts}: {key: Key; opts: Partial<KeyOptions>}): Effect =>
  async (dispatch, getState): Promise<Wallet> => {
    return new Promise(async (resolve, reject) => {
      try {
        const newWallet = (await createWalletWithOpts({
          key: key.methods!,
          opts,
        })) as Wallet;

        const {currencyAbbreviation, currencyName} = dispatch(
          mapAbbreviationAndName(
            newWallet.credentials.coin,
            newWallet.credentials.chain,
          ),
        );

        key.wallets.push(
          merge(
            newWallet,
            buildWalletObj({
              ...newWallet.credentials,
              currencyAbbreviation,
              currencyName,
            }),
          ) as Wallet,
        );

        dispatch(successAddWallet({key}));

        resolve(newWallet);
      } catch (err) {
        const errorStr =
          err instanceof Error ? err.message : JSON.stringify(err);
        dispatch(LogActions.error(`Error adding multisig wallet: ${errorStr}`));
        reject(err);
      }
    });
  };
