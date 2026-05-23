import { callBackendFunction } from '@/api/apiClient';

export const managePushSubscription = (data = {}) => {
  if (!data || Object.keys(data).length === 0) {
    return callBackendFunction('managePushSubscription', { method: 'GET' });
  }

  if (data.method === 'DELETE') {
    return callBackendFunction('managePushSubscription', { method: 'DELETE', body: { endpoint: data.endpoint } });
  }

  const body = data.subscription && !data.action
    ? { action: 'subscribe', subscription: data.subscription }
    : data;

  return callBackendFunction('managePushSubscription', { method: 'POST', body });
};

export default managePushSubscription;
