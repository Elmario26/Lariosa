import type { TestDriveBooking } from '../api/bookings';
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
  CLEAR_BOOKING_ERROR,
  CLEAR_CURRENT_BOOKING,
} from '../actions/bookings';

export interface BookingsState {
  bookings: TestDriveBooking[];
  currentBooking: TestDriveBooking | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastCreatedMessage: string | null;
  lastActionMessage: string | null;
}

interface BookingsAction {
  type: string;
  payload?: any;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastCreatedMessage: null,
  lastActionMessage: null,
};

const upsertBooking = (list: TestDriveBooking[], booking: TestDriveBooking): TestDriveBooking[] => [
  booking,
  ...list.filter((b) => b.id !== booking.id),
];

const bookingsReducer = (state: BookingsState = initialState, action: BookingsAction): BookingsState => {
  switch (action.type) {
    case GET_BOOKINGS_REQUEST:
    case GET_BOOKING_DETAIL_REQUEST:
      return { ...state, isLoading: true, error: null };

    case GET_BOOKINGS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bookings: action.payload,
        error: null,
      };

    case GET_BOOKINGS_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case GET_BOOKING_DETAIL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        currentBooking: action.payload,
        error: null,
      };

    case GET_BOOKING_DETAIL_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case CREATE_BOOKING_REQUEST:
    case UPDATE_BOOKING_REQUEST:
    case DELETE_BOOKING_REQUEST:
      return {
        ...state,
        isSubmitting: true,
        error: null,
        lastCreatedMessage: null,
        lastActionMessage: null,
      };

    case CREATE_BOOKING_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        bookings: upsertBooking(state.bookings, action.payload.booking),
        currentBooking: action.payload.booking,
        lastCreatedMessage: action.payload.message,
        error: null,
      };

    case UPDATE_BOOKING_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        bookings: upsertBooking(state.bookings, action.payload.booking),
        currentBooking: action.payload.booking,
        lastActionMessage: action.payload.message,
        error: null,
      };

    case DELETE_BOOKING_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        bookings: state.bookings.filter((b) => b.id !== action.payload.id),
        currentBooking:
          state.currentBooking?.id === action.payload.id ? null : state.currentBooking,
        lastActionMessage: action.payload.message,
        error: null,
      };

    case CREATE_BOOKING_ERROR:
    case UPDATE_BOOKING_ERROR:
    case DELETE_BOOKING_ERROR:
      return { ...state, isSubmitting: false, error: action.payload };

    case CLEAR_BOOKING_ERROR:
      return { ...state, error: null };

    case CLEAR_CURRENT_BOOKING:
      return { ...state, currentBooking: null };

    case 'CLEAR_BOOKING_SUCCESS_MESSAGE':
      return { ...state, lastCreatedMessage: null, lastActionMessage: null };

    default:
      return state;
  }
};

export default bookingsReducer;
