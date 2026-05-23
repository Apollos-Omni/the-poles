import { invokeBackendFunction } from '@/api/apiClient';

export const joinMatch = (data = {}) => invokeBackendFunction('joinMatch', data);
export default joinMatch;
