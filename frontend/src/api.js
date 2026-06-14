import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /api/plan-trip/
 * @param {{ current_location: string, pickup_location: string, dropoff_location: string, current_cycle_used_hours: number }} payload
 * @returns {Promise<{ route: object, fuel_stops: array, daily_logs: array, summary: object }>}
 */
export const planTrip = async (payload) => {
  const { data } = await api.post('/api/plan-trip/', payload);
  return data;
};

export default api;
