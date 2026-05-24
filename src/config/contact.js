export const SUPPORT_EMAIL = "support@the-poles.com";
export const PARTNER_EMAIL = "partner@the-poles.com";

export const supportMailto = ({ subject = "", body = "" } = {}) => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ""}`;
};

export const partnerMailto = ({ subject = "", body = "" } = {}) => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${PARTNER_EMAIL}${query ? `?${query}` : ""}`;
};
