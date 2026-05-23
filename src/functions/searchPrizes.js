import { invokeBackendFunction } from '@/api/apiClient';

export const searchPrizes = (data = {}) => invokeBackendFunction('searchPrizes', data);
export default searchPrizes;
