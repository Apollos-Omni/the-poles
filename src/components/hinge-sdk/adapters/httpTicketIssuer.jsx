export function makeHttpTicketIssuer(baseUrl) {
  return {
    async issue({ door_id, action, token, phone_location }) {
      const res = await fetch(`${baseUrl}/functions/v1/security-issue-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ door_id, action, phone_location }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  };
}