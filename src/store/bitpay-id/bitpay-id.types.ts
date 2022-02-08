import {Network} from '../../constants';
import {Session, User} from './bitpay-id.models';
import {
  EmailPairingStatus,
  FetchBasicInfoStatus,
  FetchSessionStatus,
  LoginStatus,
  PairingBitPayIdStatus,
  PendingLoginStatus,
  TwoFactorAuthStatus,
  TwoFactorPairingStatus,
} from './bitpay-id.reducer';

export enum BitPayIdActionTypes {
  SUCCESS_STORE_INIT = 'BitPayId/SUCCESS_STORE_INIT',
  SUCCESS_FETCH_SESSION = 'BitPayId/SUCCESS_FETCH_SESSION',
  FAILED_FETCH_SESSION = 'BitPayId/FAILED_FETCH_SESSION',
  UPDATE_FETCH_SESSION_STATUS = 'BitPayId/UPDATE_FETCH_SESSION_STATUS',
  RESET_AUTH_STACK = 'BitPayId/RESET_AUTH_STACK',
  SUCCESS_LOGIN = 'BitPayId/SUCCESS_LOGIN',
  FAILED_LOGIN = 'BitPayId/FAILED_LOGIN',
  PENDING_LOGIN = 'BitPayId/PENDING_LOGIN',
  UPDATE_LOGIN_STATUS = 'BitPayId/UPDATE_LOGIN_STATUS',
  SUCCESS_SUBMIT_TWO_FACTOR_AUTH = 'BitPayId/SUCCESS_SUBMIT_TWO_FACTOR_AUTH',
  FAILED_SUBMIT_TWO_FACTOR_AUTH = 'BitPayId/FAILED_SUBMIT_TWO_FACTOR_AUTH',
  UPDATE_TWO_FACTOR_AUTH_STATUS = 'BitPayId/UPDATE_TWO_FACTOR_AUTH_STATUS',
  SUCCESS_SUBMIT_TWO_FACTOR_PAIRING = 'BitPayId/SUCCESS_SUBMIT_TWO_FACTOR_PAIRING',
  FAILED_SUBMIT_TWO_FACTOR_PAIRING = 'BitPayId/FAILED_SUBMIT_TWO_FACTOR_PAIRING',
  UPDATE_TWO_FACTOR_PAIRING_STATUS = 'BitPayId/UPDATE_TWO_FACTOR_PAIRING_STATUS',
  SUCCESS_EMAIL_PAIRING = 'BitPayId/SUCCESS_EMAIL_PAIRING',
  FAILED_EMAIL_PAIRING = 'BitPayId/FAILED_EMAIL_PAIRING',
  UPDATE_EMAIL_PAIRING_STATUS = 'BitPayId/UPDATE_EMAIL_PAIRING_STATUS',
  SUCCESS_PAIRING_BITPAY_ID = 'BitPayId/SUCCESS_PAIRING_BITPAY_ID',
  FAILED_PAIRING_BITPAY_ID = 'BitPayId/FAILED_PAIRING_BITPAY_ID',
  UPDATE_PAIRING_BITPAY_ID_STATUS = 'BitPayId/UPDATE_PAIRING_BITPAY_ID_STATUS',
  COMPLETED_PAIRING = 'BitPayId/COMPLETED_PAIRING',
  SUCCESS_FETCH_BASIC_INFO = 'BitPayId/SUCCCESS_FETCH_BASIC_INFO',
  FAILED_FETCH_BASIC_INFO = 'BitPayId/FAILED_FETCH_BASIC_INFO',
  UPDATE_FETCH_BASIC_INFO_STATUS = 'BitPayId/UPDATE_FETCH_BASIC_INFO_STATUS',
  BITPAY_ID_DISCONNECTED = 'BitPayId/BITPAY_ID_DISCONNECTED',
}

interface SuccessStoreInit {
  type: typeof BitPayIdActionTypes.SUCCESS_STORE_INIT;
  payload: {network: Network; user: User; doshToken?: string};
}

interface SuccessFetchSession {
  type: typeof BitPayIdActionTypes.SUCCESS_FETCH_SESSION;
  payload: {session: Session};
}

interface FailedFetchSession {
  type: typeof BitPayIdActionTypes.FAILED_FETCH_SESSION;
}

interface UpdateFetchSessionStatus {
  type: typeof BitPayIdActionTypes.UPDATE_FETCH_SESSION_STATUS;
  payload: FetchSessionStatus;
}

interface ResetAuthStack {
  type: typeof BitPayIdActionTypes.RESET_AUTH_STACK;
}

interface SuccessLogin {
  type: typeof BitPayIdActionTypes.SUCCESS_LOGIN;
  payload: {network: Network; session: Session};
}

interface FailedLogin {
  type: typeof BitPayIdActionTypes.FAILED_LOGIN;
}

interface PendingLogin {
  type: typeof BitPayIdActionTypes.PENDING_LOGIN;
  payload: {status: PendingLoginStatus; session: Session};
}

interface UpdateLoginStatus {
  type: typeof BitPayIdActionTypes.UPDATE_LOGIN_STATUS;
  payload: LoginStatus;
}

interface SuccessSubmitTwoFactorAuth {
  type: typeof BitPayIdActionTypes.SUCCESS_SUBMIT_TWO_FACTOR_AUTH;
  payload: {network: Network; session: Session};
}

interface FailedSubmitTwoFactorAuth {
  type: typeof BitPayIdActionTypes.FAILED_SUBMIT_TWO_FACTOR_AUTH;
}

interface SuccessSubmitTwoFactorPairing {
  type: typeof BitPayIdActionTypes.SUCCESS_SUBMIT_TWO_FACTOR_PAIRING;
}

interface FailedSubmitTwoFactorPairing {
  type: typeof BitPayIdActionTypes.FAILED_SUBMIT_TWO_FACTOR_PAIRING;
}

interface UpdateTwoFactorAuthStatus {
  type: typeof BitPayIdActionTypes.UPDATE_TWO_FACTOR_AUTH_STATUS;
  payload: TwoFactorAuthStatus;
}

interface UpdateTwoFactorPairingStatus {
  type: typeof BitPayIdActionTypes.UPDATE_TWO_FACTOR_PAIRING_STATUS;
  payload: TwoFactorPairingStatus;
}

interface SuccessEmailPairing {
  type: typeof BitPayIdActionTypes.SUCCESS_EMAIL_PAIRING;
}

interface FailedEmailPairing {
  type: typeof BitPayIdActionTypes.FAILED_EMAIL_PAIRING;
}

interface UpdateEmailPairingStatus {
  type: typeof BitPayIdActionTypes.UPDATE_EMAIL_PAIRING_STATUS;
  payload: EmailPairingStatus;
}

interface SuccessPairingBitPayId {
  type: typeof BitPayIdActionTypes.SUCCESS_PAIRING_BITPAY_ID;
  payload: {network: Network; token: string};
}

interface FailedPairingBitPayId {
  type: typeof BitPayIdActionTypes.FAILED_PAIRING_BITPAY_ID;
}

interface UpdatePairingBitPayIdStatus {
  type: typeof BitPayIdActionTypes.UPDATE_PAIRING_BITPAY_ID_STATUS;
  payload: PairingBitPayIdStatus;
}

interface CompletedPairing {
  type: typeof BitPayIdActionTypes.COMPLETED_PAIRING;
}

interface SuccessFetchBasicInfo {
  type: typeof BitPayIdActionTypes.SUCCESS_FETCH_BASIC_INFO;
  payload: {network: Network; user: User};
}

interface FailedFetchBasicInfo {
  type: typeof BitPayIdActionTypes.FAILED_FETCH_BASIC_INFO;
}

interface UpdateFetchBasicInfoStatus {
  type: typeof BitPayIdActionTypes.UPDATE_FETCH_BASIC_INFO_STATUS;
  payload: FetchBasicInfoStatus;
}

interface BitPayIdDisconnected {
  type: typeof BitPayIdActionTypes.BITPAY_ID_DISCONNECTED;
  payload: {network: Network};
}

export type BitPayIdActionType =
  | SuccessStoreInit
  | SuccessFetchSession
  | FailedFetchSession
  | UpdateFetchSessionStatus

  // auth
  | ResetAuthStack
  | SuccessLogin
  | FailedLogin
  | PendingLogin
  | UpdateLoginStatus

  // auth + two factor
  | SuccessSubmitTwoFactorAuth
  | FailedSubmitTwoFactorAuth
  | SuccessSubmitTwoFactorPairing
  | FailedSubmitTwoFactorPairing
  | UpdateTwoFactorAuthStatus
  | UpdateTwoFactorPairingStatus
  | SuccessEmailPairing
  | FailedEmailPairing
  | UpdateEmailPairingStatus

  // deeplink pairing
  | SuccessPairingBitPayId
  | FailedPairingBitPayId
  | UpdatePairingBitPayIdStatus

  // post-pairing
  | CompletedPairing

  // user info
  | SuccessFetchBasicInfo
  | FailedFetchBasicInfo
  | UpdateFetchBasicInfoStatus
  | BitPayIdDisconnected;
