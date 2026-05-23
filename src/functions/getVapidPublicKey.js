import { callBackendFunction } from '@/api/apiClient';

export const getVapidPublicKey = () => callBackendFunction('getVapidPublicKey', { method: 'GET' });
export default getVapidPublicKey;
