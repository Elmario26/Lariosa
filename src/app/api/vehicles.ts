// Cars API calls
import { apiRequest } from './client';

interface Vehicle {
  id: string;
  brand: string;
  make: string;
  model?: string;
  year: number;
  Year?: number;
  price: number;
  status: string;
  conditions?: string;
  Mileage?: number;
  color?: string;
  images?: string[];
  image?: string;
  type?: string;
  [key: string]: any;
}

interface VehicleListResponse {
  data?: Vehicle[];
  'hydra:member'?: Vehicle[];
  total?: number;
  'hydra:totalItems'?: number;
}

/**
 * Get all cars
 * @param {object} params - Query params (page, limit, search, filter, featured, etc)
 * @param {string} token - Authentication token (optional)
 * @returns {Promise} Cars list
 */
export const getVehiclesAPI = async (
  params: Record<string, any> = {},
  token: string | null = null
): Promise<VehicleListResponse> => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  ).toString();
  const endpoint = `/cars${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
    token,
  });
};

/**
 * Get car by ID
 * @param {string} id - Car ID
 * @param {string} token - Authentication token (optional)
 * @returns {Promise} Car details
 */
export const getVehicleByIdAPI = async (
  id: string,
  token: string | null = null
): Promise<{ data?: Vehicle } | Vehicle> => {
  return apiRequest(`/cars/${id}`, {
    method: 'GET',
    token,
  });
};

/**
 * Get featured cars (uses featured query param)
 * @param {string} token - Authentication token (optional)
 * @returns {Promise} Featured cars list
 */
export const getFeaturedVehiclesAPI = async (token: string | null = null): Promise<VehicleListResponse> => {
  return apiRequest('/cars?featured=true', {
    method: 'GET',
    token,
  });
};

/**
 * Get car types/categories
 * @param {string} token - Authentication token (optional)
 * @returns {Promise} Car types list
 */
export const getVehicleTypesAPI = async (token: string | null = null): Promise<any> => {
  return apiRequest('/cars/types', {
    method: 'GET',
    token,
  });
};
