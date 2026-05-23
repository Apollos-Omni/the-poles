import { invokeBackendFunction } from '@/api/apiClient';

export const affiliateRedirect = (data = {}) => invokeBackendFunction('affiliateRedirect', data);
export default affiliateRedirect;
