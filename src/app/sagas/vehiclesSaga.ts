import { takeLatest, takeLeading, put, call, select } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { AnyAction } from 'redux';
import {
  GET_VEHICLES_REQUEST,
  GET_VEHICLES_SUCCESS,
  GET_VEHICLES_ERROR,
  GET_VEHICLE_DETAIL_REQUEST,
  GET_VEHICLE_DETAIL_SUCCESS,
  GET_VEHICLE_DETAIL_ERROR,
  GET_FEATURED_VEHICLES_REQUEST,
  GET_FEATURED_VEHICLES_SUCCESS,
  GET_FEATURED_VEHICLES_ERROR,
} from '../actions/vehicles';
import {
  getVehiclesAPI,
  getVehicleByIdAPI,
  getFeaturedVehiclesAPI,
} from '../api/vehicles';
import { RootState } from '../store';

export function* getVehiclesAsync(action: AnyAction): SagaIterator {
  try {
    console.log('[SAGA] getVehiclesAsync called with params:', action.payload);

    const { token } = yield select((state: RootState) => state.auth);
    const { refresh: _refresh, silent: _silent, ...apiParams } = action.payload ?? {};
    const response = yield call(getVehiclesAPI, apiParams, token);

    console.log('[SAGA] Vehicles fetched successfully:', response);

    yield put({
      type: GET_VEHICLES_SUCCESS,
      payload: response,
    });
  } catch (error: any) {
    console.error('[SAGA] Get vehicles error:', error.message || error);
    yield put({
      type: GET_VEHICLES_ERROR,
      payload: error.message || 'Failed to load vehicles',
    });
  }
}

export function* getVehicleDetailAsync(action: AnyAction): SagaIterator {
  try {
    console.log('[SAGA] getVehicleDetailAsync called with ID:', action.payload);

    const { token } = yield select((state: RootState) => state.auth);
    const response = yield call(getVehicleByIdAPI, action.payload, token);

    console.log('[SAGA] Vehicle detail fetched successfully:', response);

    yield put({
      type: GET_VEHICLE_DETAIL_SUCCESS,
      payload: (response as any).data || response,
    });
  } catch (error: any) {
    console.error('[SAGA] Get vehicle detail error:', error.message || error);
    yield put({
      type: GET_VEHICLE_DETAIL_ERROR,
      payload: error.message || 'Failed to load vehicle details',
    });
  }
}

export function* getFeaturedVehiclesAsync(): SagaIterator {
  try {
    console.log('[SAGA] getFeaturedVehiclesAsync called');

    const { token } = yield select((state: RootState) => state.auth);
    const response = yield call(getFeaturedVehiclesAPI, token);

    console.log('[SAGA] Featured vehicles fetched successfully:', response);

    yield put({
      type: GET_FEATURED_VEHICLES_SUCCESS,
      payload: response,
    });
  } catch (error: any) {
    console.error('[SAGA] Get featured vehicles error:', error.message || error);
    yield put({
      type: GET_FEATURED_VEHICLES_ERROR,
      payload: error.message || 'Failed to load featured vehicles',
    });
  }
}

export function* vehiclesSaga(): SagaIterator {
  // takeLatest so pull-to-refresh is not ignored while a fetch is in flight (takeLeading drops it)
  yield takeLatest(GET_VEHICLES_REQUEST, getVehiclesAsync);
  yield takeLatest(GET_VEHICLE_DETAIL_REQUEST, getVehicleDetailAsync);
  yield takeLeading(GET_FEATURED_VEHICLES_REQUEST, getFeaturedVehiclesAsync);
}
