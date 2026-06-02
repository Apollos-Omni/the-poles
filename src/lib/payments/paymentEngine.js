import { apiRequest } from '@/api/apiClient';

export async function getPaymentConfig() {
  return apiRequest('/api/payments/config');
}

export async function startStripeConnectOnboarding() {
  return apiRequest('/api/payments/connect/onboarding', {
    method: 'POST',
    body: {},
  });
}

export async function getStripeConnectStatus() {
  return apiRequest('/api/payments/connect/status');
}

export async function createPrizeRoomCheckout({ roomId, paymentMode = 'stripe_test' }) {
  const response = await apiRequest(`/api/payments/prize-rooms/${encodeURIComponent(roomId)}/checkout`, {
    method: 'POST',
    body: { paymentMode },
  });

  return response.data || response;
}

export async function getPrizeRoomAllocation({ roomId }) {
  return apiRequest(`/api/payments/prize-rooms/${encodeURIComponent(roomId)}/allocation`);
}

export async function releaseCreatorPayout({ roomId, amountCents, payoutMode = 'manual' }) {
  const response = await apiRequest(`/api/payments/admin/prize-rooms/${encodeURIComponent(roomId)}/creator-payout`, {
    method: 'POST',
    body: { amountCents, payoutMode },
  });

  return response.data || response;
}
