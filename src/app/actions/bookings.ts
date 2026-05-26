import type { BookingStatus, CreateBookingPayload, UpdateBookingPayload } from '../api/bookings';

export const GET_BOOKINGS_REQUEST = 'GET_BOOKINGS_REQUEST';
export const GET_BOOKINGS_SUCCESS = 'GET_BOOKINGS_SUCCESS';
export const GET_BOOKINGS_ERROR = 'GET_BOOKINGS_ERROR';

export const GET_BOOKING_DETAIL_REQUEST = 'GET_BOOKING_DETAIL_REQUEST';
export const GET_BOOKING_DETAIL_SUCCESS = 'GET_BOOKING_DETAIL_SUCCESS';
export const GET_BOOKING_DETAIL_ERROR = 'GET_BOOKING_DETAIL_ERROR';

export const CREATE_BOOKING_REQUEST = 'CREATE_BOOKING_REQUEST';
export const CREATE_BOOKING_SUCCESS = 'CREATE_BOOKING_SUCCESS';
export const CREATE_BOOKING_ERROR = 'CREATE_BOOKING_ERROR';

export const UPDATE_BOOKING_REQUEST = 'UPDATE_BOOKING_REQUEST';
export const UPDATE_BOOKING_SUCCESS = 'UPDATE_BOOKING_SUCCESS';
export const UPDATE_BOOKING_ERROR = 'UPDATE_BOOKING_ERROR';

export const DELETE_BOOKING_REQUEST = 'DELETE_BOOKING_REQUEST';
export const DELETE_BOOKING_SUCCESS = 'DELETE_BOOKING_SUCCESS';
export const DELETE_BOOKING_ERROR = 'DELETE_BOOKING_ERROR';

export const CLEAR_BOOKING_ERROR = 'CLEAR_BOOKING_ERROR';
export const CLEAR_CURRENT_BOOKING = 'CLEAR_CURRENT_BOOKING';

export interface GetBookingsOptions {
  status?: BookingStatus;
  /** Background poll — no spinner or pull-to-refresh animation */
  silent?: boolean;
  /** User pulled to refresh — show refresh indicator only */
  refresh?: boolean;
}

export const getBookingsRequest = (options?: GetBookingsOptions | BookingStatus) => {
  const payload =
    typeof options === 'string' ? { status: options } : options ?? {};
  return {
    type: GET_BOOKINGS_REQUEST,
    payload,
  };
};

export const getBookingDetailRequest = (bookingId: number) => ({
  type: GET_BOOKING_DETAIL_REQUEST,
  payload: bookingId,
});

export const createBookingRequest = (payload: CreateBookingPayload) => ({
  type: CREATE_BOOKING_REQUEST,
  payload,
});

export const updateBookingRequest = (bookingId: number, payload: UpdateBookingPayload) => ({
  type: UPDATE_BOOKING_REQUEST,
  payload: { bookingId, ...payload },
});

export const deleteBookingRequest = (bookingId: number) => ({
  type: DELETE_BOOKING_REQUEST,
  payload: bookingId,
});

export const clearBookingError = () => ({
  type: CLEAR_BOOKING_ERROR,
});

export const clearBookingSuccessMessage = () => ({
  type: 'CLEAR_BOOKING_SUCCESS_MESSAGE',
});
