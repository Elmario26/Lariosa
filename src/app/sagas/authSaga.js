import { takeLatest, put } from 'redux-saga/effects'
import { USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGIN_ERROR } from '../actions'
import { loginAPI } from '../api/auth'

export function* userLoginAsync(action) {
  try {
    console.log('[SAGA] userLoginAsync called with action:', action)
    
    const { email, password } = action.payload
    console.log('[SAGA] Extracted credentials - Email:', email, 'Password: ***')
    
    console.log('[SAGA] Calling loginAPI...')
    const response = yield loginAPI(email, password)
    console.log('[SAGA] API Response received:', response)
    
    // Dispatch success action with response data
    console.log('[SAGA] Dispatching USER_LOGIN_SUCCESS')
    yield put({
      type: USER_LOGIN_SUCCESS,
      payload: response.data,
    })
  } catch (error) {
    console.error('[SAGA] Login error:', error.message)
    // Dispatch error action with error message
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error.message || 'Login failed. Please try again.',
    })
  }
}

export function* authSaga() {
  yield takeLatest(USER_LOGIN_REQUEST, userLoginAsync)
}