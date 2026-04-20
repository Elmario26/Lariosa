import { takeLatest, put, select, call } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { AnyAction } from 'redux';
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_ERROR,
} from '../actions';
import { loginAPI, logoutAPI } from '../api/auth';
import { RootState } from '../store';

export function* userLoginAsync(action: AnyAction): SagaIterator {
  try {
    console.log('[SAGA] userLoginAsync called with action:', action);

    const { email, password } = action.payload;
    console.log('[SAGA] Extracted credentials - Email:', email, 'Password: ***');
    console.log('[SAGA] Calling loginAPI...');
    const response = yield call(loginAPI, email, password);
    console.log('[SAGA] API Response received:', response);
    console.log('[SAGA] Dispatching USER_LOGIN_SUCCESS');
    yield put({
      type: USER_LOGIN_SUCCESS,
      payload: response,
    });
  } catch (error: any) {
    console.error('[SAGA] Login error:', error.message || error);
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error.message || 'Login failed. Please try again.',
    });
  }
}

export function* userLogoutAsync(): SagaIterator {
  try {
    const token: string | null = yield select((state: RootState) => state.auth.token);
    if (token) {
      yield call(logoutAPI, token);
    }
    yield put({ type: LOGOUT_SUCCESS });
  } catch (error: any) {
    yield put({
      type: LOGOUT_ERROR,
      payload: error.message || 'Logout failed. Please try again.',
    });
  }
}

export function* authSaga(): SagaIterator {
  yield takeLatest(USER_LOGIN_REQUEST, userLoginAsync);
  yield takeLatest(LOGOUT_REQUEST, userLogoutAsync);
}
