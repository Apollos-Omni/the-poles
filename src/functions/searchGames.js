import { invokeBackendFunction } from '@/api/apiClient';

export const searchGames = (data = {}) => invokeBackendFunction('searchGames', data);
export default searchGames;
