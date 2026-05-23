import { invokeBackendFunction } from '@/api/apiClient';

export const searchProducts = (data = {}) => invokeBackendFunction('searchProducts', data);
export default searchProducts;
