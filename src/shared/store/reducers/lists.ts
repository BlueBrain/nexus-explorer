import { Action, Reducer } from 'redux';
import { FetchableState } from './utils';
import { Resource, PaginationSettings, PaginatedList } from '@bbp/nexus-sdk';
import {
  ListActions,
  ListActionTypes,
  ProjectListActions,
} from '../actions/lists';
import { moveTo } from '../../utils';
import createByKey from './utils/createByKey';

export interface List extends FetchableState<PaginatedList<Resource>> {
  name: string;
  query: {
    filters: {
      [filterKey: string]: string[];
    };
    textQuery?: string;
  };
  paginationSettings: PaginationSettings;
}

// serialize / deserialze to URL param
// maybe with middleware?
// when something inside lists changes (inisde query, the input)
// then we should update the URL with a serialied array of queries
export type ListState = List[];

const DEFAULT_RESOURCE_PAGINATION_SIZE = 20;

const DEFAULT_PAGINATION_SETTINGS = {
  from: 0,
  size: DEFAULT_RESOURCE_PAGINATION_SIZE,
};

const DEFAULT_LIST: List = {
  name: 'Default List',
  query: {
    filters: {},
  },
  isFetching: true,
  paginationSettings: DEFAULT_PAGINATION_SETTINGS,
  data: null,
  error: null,
};

const initialState: ListState = [DEFAULT_LIST]; // Get Initial State from URL or DEFAULT_LIST?

export function listsReducer(
  state: ListState = initialState,
  action: ListActions
) {
  switch (action.type) {
    case ListActionTypes.CREATE:
      const newList = { ...DEFAULT_LIST, name: `New List ${state.length + 1}` };
      return [...state, newList];
    case ListActionTypes.DELETE:
      return [
        ...state.slice(0, action.payload.listIndex),
        ...state.slice(action.payload.listIndex + 1),
      ];
    case ListActionTypes.UPDATE:
      return [
        ...state.map((list, listIndex) =>
          listIndex === action.payload.listIndex ? action.payload.list : list
        ),
      ];
    case ListActionTypes.CHANGE_INDEX:
      return [
        ...moveTo(state, action.payload.listIndex, action.payload.moveToIndex),
      ];
    default:
      return state;
  }
}

interface ListsByProjectState {
  [orgAndProjectLabel: string]: ListState;
}

const listReducerByKey = createByKey(
  action => action.hasOwnProperty('filterKey'),
  (action: { filterKey: string }) => action.filterKey
)(listsReducer as Reducer);

export default function listsByProjectReducer(
  state: ListsByProjectState = {},
  action: ListActions | ProjectListActions
) {
  switch (action.type) {
    case 'INITIALIZE_PROJECT_LIST':
      return {
        ...state,
        [action.payload.orgAndProjectLabel]: initialState,
      };
    default:
      return listReducerByKey(state, action);
  }
}
