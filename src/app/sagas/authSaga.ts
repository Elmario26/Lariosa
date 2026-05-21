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
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_ERROR,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_ERROR,
} from '../actions';
import { loginAPI, logoutAPI, registerAPI, getCurrentUser } from '../api/auth';
import { RootState } from '../store';

export function* userLoginAsync(action: AnyAction): SagaIterator {
  try {
    console.log('[SAGA] userLoginAsync called with action:', action);

    const { email, password } = action.payload;
    console.log('[SAGA] Extracted credentials - Email:', email, 'Password: ***');
    console.log('[SAGA] Calling loginAPI...');
    const response = yield call(loginAPI, email, password);
    console.log('[SAGA] Login token received');

    const user = yield call(getCurrentUser, response.token);
    console.log('[SAGA] Profile loaded:', user.email);

    yield put({
      type: USER_LOGIN_SUCCESS,
      payload: { ...response, user },
    });
  } catch (error: any) {
    console.error('[SAGA] Login error:', error.message || error);
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error.message || 'Login failed. Please try again.',
    });
  }
}

export function* userRegisterAsync(action: AnyAction): SagaIterator {
  try {
    const response = yield call(registerAPI, action.payload);
    yield put({ type: REGISTER_SUCCESS, payload: response });
  } catch (error: any) {
    yield put({
      type: REGISTER_ERROR,
      payload: error.message || 'Registration failed. Please try again.',
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

export function* getUserAsync(): SagaIterator {
  try {
    const token: string | null = yield select((state: RootState) => state.auth.token);
    if (!token) return;

    const user = yield call(getCurrentUser, token);
    yield put({ type: GET_USER_SUCCESS, payload: user });
  } catch (error: any) {
    yield put({
      type: GET_USER_ERROR,
      payload: error.message || 'Failed to load profile',
    });
  }
}

export function* authSaga(): SagaIterator {
  yield takeLatest(USER_LOGIN_REQUEST, userLoginAsync);
  yield takeLatest(REGISTER_REQUEST, userRegisterAsync);
  yield takeLatest(LOGOUT_REQUEST, userLogoutAsync);
  yield takeLatest(GET_USER_REQUEST, getUserAsync);
}
