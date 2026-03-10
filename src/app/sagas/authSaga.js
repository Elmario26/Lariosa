import { takeLatest, put, select, call } from 'redux-saga/effects'
import { USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGIN_ERROR, LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_ERROR } from '../actions'
import { loginAPI, logoutAPI } from '../api/auth'

export function* userLoginAsync(action) {
  try {
    console.log('[SAGA] userLoginAsync called with action:', action)
    
    const { email, password } = action.payload
    console.log('[SAGA] Extracted credentials - Email:', email, 'Password: ***')
    
    console.log('[SAGA] Calling loginAPI...')
    const response = yield loginAPI(email, password)
    console.log('[SAGA] API Response received:', response)
    
    // Dispatch success action with response data
    // API returns: { user: {...}, token: "...", refreshToken: "..." }
    console.log('[SAGA] Dispatching USER_LOGIN_SUCCESS')
    yield put({
      type: USER_LOGIN_SUCCESS,
      payload: response,  // Response IS the data, not response.data
    })
  } catch (error) {
    console.error('[SAGA] Login error:', error.message || error)
    // Dispatch error action with error message
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error.message || 'Login failed. Please try again.',
    })
  }
}

export function* userLogoutAsync() {
  try {
    const token = yield select(state => state.auth.token)
    if (token) {
      yield call(logoutAPI, token)
    }
    yield put({ type: LOGOUT_SUCCESS })
  } catch (error) {
    yield put({
      type: LOGOUT_ERROR,
      payload: error.message || 'Logout failed. Please try again.',
    })
  }
}

export function* authSaga() {
  yield takeLatest(USER_LOGIN_REQUEST, userLoginAsync)
  yield takeLatest(LOGOUT_REQUEST, userLogoutAsync)
}