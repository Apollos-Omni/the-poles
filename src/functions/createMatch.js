import { invokeBackendFunction } from '@/api/apiClient';

export const createMatch = (data = {}) => invokeBackendFunction('createMatch', data);
export default createMatch;
