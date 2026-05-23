import { apiRaw } from '@/api/apiClient';

export const downloadAgentToolkit = async () => {
  const response = await apiRaw('/api/functions/downloadAgentToolkit', { method: 'GET' });
  const blob = response.ok ? await response.blob() : null;
  return {
    ok: response.ok,
    status: response.status,
    data: blob,
    json: async () => {
      try { return await response.clone().json(); } catch { return { error: `HTTP ${response.status}` }; }
    },
  };
};

export default downloadAgentToolkit;
