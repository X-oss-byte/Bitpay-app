import {FetchCardsStatus} from './card.reducer';
import {CardActionType, CardActionTypes} from './card.types';

export const successFetchCards = (): CardActionType => ({
  type: CardActionTypes.SUCCESS_FETCH_CARDS,
  payload: {},
});

export const failedFetchCards = (): CardActionType => ({
  type: CardActionTypes.FAILED_FETCH_CARDS,
});

export const updateFetchCardsStatus = (
  status: FetchCardsStatus,
): CardActionType => ({
  type: CardActionTypes.UPDATE_FETCH_CARDS_STATUS,
  payload: status,
});
