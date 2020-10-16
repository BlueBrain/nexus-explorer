import {
  AuthActions,
  AuthFailedAction,
  AuthActionTypes,
} from '../actions/auth';
import { createFetchReducer, FetchableState } from './utils';
import { IdentityList, PaginatedList, ACL, Realm } from '@bbp/nexus-sdk';

export interface AuthState {
  identities?: FetchableState<IdentityList>;
  acls?: FetchableState<PaginatedList<ACL>>;
  realms?: FetchableState<PaginatedList<Realm>>;
  loginError?: {
    error: Error;
  };
}

const initialState: AuthState = {};

const identityReducer = createFetchReducer(
  {
    FETCHING: AuthActionTypes.IDENTITY_FETCHING,
    FULFILLED: AuthActionTypes.IDENTITY_FULFILLED,
    FAILED: AuthActionTypes.IDENTITY_FAILED,
  },
  []
);
const realmReducer = createFetchReducer(
  {
    FETCHING: AuthActionTypes.REALM_FETCHING,
    FULFILLED: AuthActionTypes.REALM_FULFILLED,
    FAILED: AuthActionTypes.REALM_FAILED,
  },
  []
);

function authReducer(
  state: AuthState = initialState,
  action: AuthActions | AuthFailedAction
): AuthState {
  console.log(action.type);
  if (action.type.startsWith('@@nexus/AUTH_IDENTITY_')) {
    return {
      ...state,
      identities: identityReducer(state.identities, action),
    };
  }
  if (action.type.startsWith('@@nexus/AUTH_REALM_')) {
    return {
      ...state,
      realms: realmReducer(state.realms, action),
    };
  }
  if (action.type.startsWith('@@nexus/LOGIN_FAILED')) {
    const ac = action as AuthFailedAction;

    return {
      ...state,
      loginError: {
        error: ac.error,
      },
    };
  }
  return state;
}

export default authReducer;
