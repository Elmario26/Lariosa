// Auth Saga
import { call, put, takeEvery, select } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loginAPI, registerAPI, logoutAPI, getCurrentUser } from '../api/auth'

/**
 * Worker saga for login
 */
function* loginSaga(action) {
  try {
    yield put({ type: 'LOGIN_REQUEST' })

    const { email, password } = action.payload
    const response = yield call(loginAPI, email, password)

    // Save token to AsyncStorage
    yield call(
      AsyncStorage.setItem,
      'authToken',
      response.token
    )

    if (response.refreshToken) {
      yield call(
        AsyncStorage.setItem,
        'refreshToken',
        response.refreshToken
      )
    }

    yield put({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      },
    })
  } catch (error) {
    console.log('Login error:', error)
    yield put({
      type: 'LOGIN_FAILURE',
      payload: error.message || 'Login failed',
    })
  }
}

/**
 * Worker saga for registration
 */
function* registerSaga(action) {
  try {
    yield put({ type: 'REGISTER_REQUEST' })

    const userData = action.payload
    const response = yield call(registerAPI, userData)

    // Save token to AsyncStorage
    yield call(
      AsyncStorage.setItem,
      'authToken',
      response.token
    )

    if (response.refreshToken) {
      yield call(
        AsyncStorage.setItem,
        'refreshToken',
        response.refreshToken
      )
    }

    yield put({
      type: 'REGISTER_SUCCESS',
      payload: {
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      },
    })
  } catch (error) {
    console.log('Registration error:', error)
    yield put({
      type: 'REGISTER_FAILURE',
      payload: error.message || 'Registration failed',
    })
  }
}

/**
 * Worker saga for logout
 */
function* logoutSaga(action) {
  try {
    yield put({ type: 'LOGOUT_REQUEST' })

    const state = yield select()
    const token = state.auth.token

    // If you have a token, call logout API
    if (token) {
      yield call(logoutAPI, token)
    }

    // Remove tokens from AsyncStorage
    yield call(AsyncStorage.removeItem, 'authToken')
    yield call(AsyncStorage.removeItem, 'refreshToken')

    yield put({
      type: 'LOGOUT_SUCCESS',
    })
  } catch (error) {
    console.log('Logout error:', error)
    yield put({
      type: 'LOGOUT_FAILURE',
      payload: error.message || 'Logout failed',
    })
  }
}

/**
 * Worker saga to get current user
 */
function* getUserSaga(action) {
  try {
    yield put({ type: 'GET_USER_REQUEST' })

    const state = yield select()
    const token = state.auth.token

    if (!token) {
      yield put({
        type: 'GET_USER_FAILURE',
        payload: 'No authentication token',
      })
      return
    }

    const response = yield call(getCurrentUser, token)

    yield put({
      type: 'GET_USER_SUCCESS',
      payload: response.user,
    })
  } catch (error) {
    console.log('Get user error:', error)
    yield put({
      type: 'GET_USER_FAILURE',
      payload: error.message || 'Failed to fetch user',
    })
  }
}

/**
 * Root saga
 */
export function* authSaga() {
  yield takeEvery('LOGIN', loginSaga)
  yield takeEvery('REGISTER', registerSaga)
  yield takeEvery('LOGOUT', logoutSaga)
  yield takeEvery('GET_USER', getUserSaga)
}
