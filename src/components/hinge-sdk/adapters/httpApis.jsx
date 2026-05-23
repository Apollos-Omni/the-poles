export function makeCatalogApi(baseUrl) {
  return {
    async listDoors() {
      const r = await fetch(`${baseUrl}/rest/v1/doors?select=*,device_id,policy_id`);
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async getPolicy(id) {
      const r = await fetch(`${baseUrl}/rest/v1/policies?id=eq.${id}&select=*`);
      if (!r.ok) throw new Error(await r.text());
      const [p] = await r.json();
      return p ?? null;
    }
  };
}

export function makeRaffleApi(baseUrl) {
  return {
    async list() {
      const r = await fetch(`${baseUrl}/rest/v1/raffles?select=*`);
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async enter(raffle_id, client_seed, token) {
      const r = await fetch(`${baseUrl}/rest/v1/raffle_entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raffle_id, client_seed, weight: 1 }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async reveal(raffle_id) {
      const r = await fetch(`${baseUrl}/functions/v1/raffle-reveal`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffle_id }) 
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
  };
}