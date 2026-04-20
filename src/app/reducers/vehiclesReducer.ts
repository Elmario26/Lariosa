import { Vehicle } from '../actions/vehicles';
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
  SET_VEHICLE_FILTERS,
  CLEAR_VEHICLE_ERROR,
} from '../actions/vehicles';

// Vehicle state interface
export interface VehicleFilters {
  search: string;
  type: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface VehiclePagination {
  page: number;
  limit: number;
  total: number;
}

export interface VehiclesState {
  vehicles: Vehicle[];
  featuredVehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  filters: VehicleFilters;
  pagination: VehiclePagination;
}

// Action interface
interface VehiclesAction {
  type: string;
  payload?: any;
}

// Initial state
const initialState: VehiclesState = {
  vehicles: [],
  featuredVehicles: [],
  currentVehicle: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    type: 'All',
    minPrice: null,
    maxPrice: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const vehiclesReducer = (state: VehiclesState = initialState, action: VehiclesAction): VehiclesState => {
  switch (action.type) {
    case GET_VEHICLES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case GET_VEHICLES_SUCCESS: {
      // Handle different response formats: { data: [...] }, { 'hydra:member': [...] }, or [...]
      const vehiclesData =
        action.payload.data || action.payload['hydra:member'] || action.payload || [];
      return {
        ...state,
        isLoading: false,
        vehicles: Array.isArray(vehiclesData) ? vehiclesData : [],
        pagination: {
          ...state.pagination,
          total:
            action.payload.total ||
            action.payload['hydra:totalItems'] ||
            (Array.isArray(vehiclesData) ? vehiclesData.length : 0),
        },
        error: null,
      };
    }
    case GET_VEHICLES_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case GET_VEHICLE_DETAIL_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case GET_VEHICLE_DETAIL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        currentVehicle: action.payload,
        error: null,
      };
    case GET_VEHICLE_DETAIL_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case GET_FEATURED_VEHICLES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case GET_FEATURED_VEHICLES_SUCCESS: {
      // Handle different response formats: { data: [...] }, { 'hydra:member': [...] }, or [...]
      const featuredData =
        action.payload.data || action.payload['hydra:member'] || action.payload || [];
      return {
        ...state,
        isLoading: false,
        featuredVehicles: Array.isArray(featuredData) ? featuredData : [],
        error: null,
      };
    }
    case GET_FEATURED_VEHICLES_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case SET_VEHICLE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case CLEAR_VEHICLE_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default vehiclesReducer;
