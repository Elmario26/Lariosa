// Cars API calls
import { apiRequest } from './client';
import { buildQueryParams } from './queryParams';

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
  count?: number;
}

/** Railway / API Platform may return a bare JSON array or { data: [...] }. */
export function normalizeVehicleListResponse(
  response: Vehicle[] | VehicleListResponse
): { data: Vehicle[]; total: number } {
  if (Array.isArray(response)) {
    return { data: response, total: response.length };
  }

  const data =
    response.data ??
    response['hydra:member'] ??
    [];

  const total =
    response.total ??
    response['hydra:totalItems'] ??
    response.count ??
    data.length;

  return { data: Array.isArray(data) ? data : [], total };
}

/**
 * Get all cars
 * @param {object} params - Query params (page, limit, search, filter, featured, etc)
 * @param {string} token - Authentication token (optional; list is public on server)
 * @returns {Promise} Cars list
 */
export const getVehiclesAPI = async (
  params: Record<string, any> = {},
  _token: string | null = null
): Promise<{ data: Vehicle[]; total: number }> => {
  const queryString = buildQueryParams(params);
  const endpoint = `/cars${queryString ? `?${queryString}` : ''}`;

  const raw = await apiRequest<Vehicle[] | VehicleListResponse>(endpoint, {
    method: 'GET',
    // Public endpoint — omit JWT so a stale/invalid token cannot break the list call
    token: null,
  });

  return normalizeVehicleListResponse(raw);
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
/** Backend has no featured filter — returns same collection as /cars */
export const getFeaturedVehiclesAPI = async (
  _token: string | null = null
): Promise<{ data: Vehicle[]; total: number }> => {
  const raw = await apiRequest<Vehicle[] | VehicleListResponse>('/cars', {
    method: 'GET',
    token: null,
  });
  return normalizeVehicleListResponse(raw);
};
