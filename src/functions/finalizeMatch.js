import { invokeBackendFunction } from '@/api/apiClient';

export const finalizeMatch = (data = {}) => invokeBackendFunction('finalizeMatch', data);
export default finalizeMatch;
