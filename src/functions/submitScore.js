import { invokeBackendFunction } from '@/api/apiClient';

export const submitScore = (data = {}) => invokeBackendFunction('submitScore', data);
export default submitScore;
