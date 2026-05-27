import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { AnyAction } from 'redux';
import {
  GET_BOOKINGS_REQUEST,
  GET_BOOKINGS_SUCCESS,
  GET_BOOKINGS_ERROR,
  GET_BOOKING_DETAIL_REQUEST,
  GET_BOOKING_DETAIL_SUCCESS,
  GET_BOOKING_DETAIL_ERROR,
  CREATE_BOOKING_REQUEST,
  CREATE_BOOKING_SUCCESS,
  CREATE_BOOKING_ERROR,
  UPDATE_BOOKING_REQUEST,
  UPDATE_BOOKING_SUCCESS,
  UPDATE_BOOKING_ERROR,
  DELETE_BOOKING_REQUEST,
  DELETE_BOOKING_SUCCESS,
  DELETE_BOOKING_ERROR,
} from '../actions/bookings';
import {
  getTestDriveBookingsAPI,
  getTestDriveBookingByIdAPI,
  createTestDriveBookingAPI,
  updateTestDriveBookingAPI,
  deleteTestDriveBookingAPI,
  canModifyBooking,
  type TestDriveBooking,
} from '../api/bookings';
import { RootState } from '../store';

function* getBookingsAsync(action: AnyAction): SagaIterator {
  try {
    const { token } = yield select((state: RootState) => state.auth);
    if (!token) {
      throw { message: 'Please log in to view bookings' };
    }
    const bookings = yield call(getTestDriveBookingsAPI, token, action.payload?.status);
    yield put({ type: GET_BOOKINGS_SUCCESS, payload: bookings });
  } catch (error: any) {
    yield put({
      type: GET_BOOKINGS_ERROR,
      payload: error.message || 'Failed to load bookings',
    });
  }
}

function* getBookingDetailAsync(action: AnyAction): SagaIterator {
  try {
    const { token } = yield select((state: RootState) => state.auth);
    if (!token) {
      throw { message: 'Please log in' };
    }
    const booking = yield call(getTestDriveBookingByIdAPI, action.payload, token);
    yield put({ type: GET_BOOKING_DETAIL_SUCCESS, payload: booking });
  } catch (error: any) {
    yield put({
      type: GET_BOOKING_DETAIL_ERROR,
      payload: error.message || 'Failed to load booking',
    });
  }
}

function* createBookingAsync(action: AnyAction): SagaIterator {
  try {
    const { token } = yield select((state: RootState) => state.auth);
    if (!token) {
      throw { message: 'Please log in to book a test drive' };
    }
    const booking = yield call(createTestDriveBookingAPI, action.payload, token);
    yield put({
      type: CREATE_BOOKING_SUCCESS,
      payload: {
        booking,
        message: 'Test drive request submitted. We will notify you when staff approves it.',
      },
    });
  } catch (error: any) {
    yield put({
      type: CREATE_BOOKING_ERROR,
      payload: error.message || 'Failed to create booking',
    });
  }
}

function* findTestDriveBooking(bookingId: number): SagaIterator {
  const { bookings, currentBooking } = yield select((state: RootState) => state.bookings);
  if (currentBooking?.id === bookingId) return currentBooking;
  return bookings.find((b: TestDriveBooking) => b.id === bookingId) ?? null;
}

function* updateBookingAsync(action: AnyAction): SagaIterator {
  try {
    const { token } = yield select((state: RootState) => state.auth);
    if (!token) {
      throw { message: 'Please log in' };
    }
    const { bookingId, ...payload } = action.payload;
    const existing = yield call(findTestDriveBooking, bookingId);
    if (existing && !canModifyBooking(existing)) {
      throw { message: 'Only pending bookings can be updated.' };
    }
    const booking = yield call(updateTestDriveBookingAPI, bookingId, payload, token);
    yield put({
      type: UPDATE_BOOKING_SUCCESS,
      payload: { booking, message: 'Booking updated successfully.' },
    });
  } catch (error: any) {
    yield put({
      type: UPDATE_BOOKING_ERROR,
      payload: error.message || 'Failed to update booking',
    });
  }
}

function* deleteBookingAsync(action: AnyAction): SagaIterator {
  try {
    const { token } = yield select((state: RootState) => state.auth);
    if (!token) {
      throw { message: 'Please log in' };
    }
    const bookingId = action.payload as number;
    const existing = yield call(findTestDriveBooking, bookingId);
    if (existing && !canModifyBooking(existing)) {
      throw { message: 'Only pending bookings can be cancelled.' };
    }
    yield call(deleteTestDriveBookingAPI, bookingId, token);
    yield put({
      type: DELETE_BOOKING_SUCCESS,
      payload: { id: action.payload, message: 'Booking cancelled.' },
    });
  } catch (error: any) {
    yield put({
      type: DELETE_BOOKING_ERROR,
      payload: error.message || 'Failed to cancel booking',
    });
  }
}

export function* bookingsSaga(): SagaIterator {
  yield takeLatest(GET_BOOKINGS_REQUEST, getBookingsAsync);
  yield takeLatest(GET_BOOKING_DETAIL_REQUEST, getBookingDetailAsync);
  yield takeLatest(CREATE_BOOKING_REQUEST, createBookingAsync);
  yield takeLatest(UPDATE_BOOKING_REQUEST, updateBookingAsync);
  yield takeLatest(DELETE_BOOKING_REQUEST, deleteBookingAsync);
}
