// Vehicle Action Types
export const GET_VEHICLES_REQUEST = 'GET_VEHICLES_REQUEST';
export const GET_VEHICLES_SUCCESS = 'GET_VEHICLES_SUCCESS';
export const GET_VEHICLES_ERROR = 'GET_VEHICLES_ERROR';

export const GET_VEHICLE_DETAIL_REQUEST = 'GET_VEHICLE_DETAIL_REQUEST';
export const GET_VEHICLE_DETAIL_SUCCESS = 'GET_VEHICLE_DETAIL_SUCCESS';
export const GET_VEHICLE_DETAIL_ERROR = 'GET_VEHICLE_DETAIL_ERROR';

export const GET_FEATURED_VEHICLES_REQUEST = 'GET_FEATURED_VEHICLES_REQUEST';
export const GET_FEATURED_VEHICLES_SUCCESS = 'GET_FEATURED_VEHICLES_SUCCESS';
export const GET_FEATURED_VEHICLES_ERROR = 'GET_FEATURED_VEHICLES_ERROR';

export const SET_VEHICLE_FILTERS = 'SET_VEHICLE_FILTERS';
export const CLEAR_VEHICLE_ERROR = 'CLEAR_VEHICLE_ERROR';

// Vehicle Filters
interface VehicleFilters {
  search: string;
  type: string;
  minPrice: number | null;
  maxPrice: number | null;
}

// Action payload types
export interface GetVehiclesPayload {
  [key: string]: any;
}

export interface Vehicle {
  id: string;
  brand: string;
  make: string;
  model?: string;
  year: number;
  price: number;
  status: string;
  images?: string[];
  [key: string]: any;
}

export interface GetVehiclesOptions {
  search?: string;
  type?: string;
  /** Pull-to-refresh — keep list visible, show refresh indicator */
  refresh?: boolean;
  [key: string]: unknown;
}

// Action Creators
export const getVehiclesRequest = (params: GetVehiclesOptions = {}) => ({
  type: GET_VEHICLES_REQUEST,
  payload: params,
});

export const getVehiclesSuccess = (vehicles: any) => ({
  type: GET_VEHICLES_SUCCESS,
  payload: vehicles,
});

export const getVehiclesError = (error: string) => ({
  type: GET_VEHICLES_ERROR,
  payload: error,
});

export const getVehicleDetailRequest = (id: string) => ({
  type: GET_VEHICLE_DETAIL_REQUEST,
  payload: id,
});

export const getVehicleDetailSuccess = (vehicle: Vehicle) => ({
  type: GET_VEHICLE_DETAIL_SUCCESS,
  payload: vehicle,
});

export const getVehicleDetailError = (error: string) => ({
  type: GET_VEHICLE_DETAIL_ERROR,
  payload: error,
});

export const getFeaturedVehiclesRequest = () => ({
  type: GET_FEATURED_VEHICLES_REQUEST,
});

export const getFeaturedVehiclesSuccess = (vehicles: any) => ({
  type: GET_FEATURED_VEHICLES_SUCCESS,
  payload: vehicles,
});

export const getFeaturedVehiclesError = (error: string) => ({
  type: GET_FEATURED_VEHICLES_ERROR,
  payload: error,
});

export const setVehicleFilters = (filters: Partial<VehicleFilters>) => ({
  type: SET_VEHICLE_FILTERS,
  payload: filters,
});

export const clearVehicleError = () => ({
  type: CLEAR_VEHICLE_ERROR,
});
