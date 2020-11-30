import { AnyAction } from 'redux';
import { createFetchReducer, FetchableState } from './utils';
import {
  SearchActionTypes,
  SearchConfigActions,
  FetchSearchConfigsFulfilledAction,
  FetchSearchConfigsFailedAction,
  SearchPreferenceActions,
  SetSearchPreference,
  SearchPreferenceTypes,
} from '../actions/search';

export const SearchConfigType = 'nxv:SearchConfig';

export type SearchConfig = {
  label: string;
  view: string;
  description?: string;
};

export const DEFAULT_SEARCH_STATE = {
  searchConfigs: {
    isFetching: false,
    data: null,
    error: null,
  },
  searchPreference: null,
};

export interface SearchState {
  searchConfigs: FetchableState<SearchConfig[]>;
  searchPreference: string | null;
}

const searchConfigsReducer = createFetchReducer(
  {
    FETCHING: SearchActionTypes.SEARCH_CONFIG_FETCHING,
    FULFILLED: SearchActionTypes.SEARCH_CONFIG_FULFILLED,
    FAILED: SearchActionTypes.SEARCH_CONFIG_FAILED,
  },
  []
);

export default function searchReducer(
  state: SearchState = DEFAULT_SEARCH_STATE,
  action: SearchConfigActions | SearchPreferenceActions | AnyAction
) {
  if (action.type.startsWith('@@nexus/SEARCH_CONFIG')) {
    return {
      ...state,
      searchConfigs: searchConfigsReducer(state.searchConfigs, action),
    };
  }
  if (action.type.startsWith('@@nexus/SEARCH_PREFERENCE')) {
    switch (action.type) {
      case SearchPreferenceTypes.SEARCH_PREFERENCE_SET:
        return {
          ...state,
          searchPreference: (action as SearchPreferenceActions).payload,
        };
    }
  }
  return state;
}
