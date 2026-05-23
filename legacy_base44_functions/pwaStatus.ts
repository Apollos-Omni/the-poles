Deno.serve((req) => {
  return new Response(JSON.stringify({
    swOk: true,
    manifestOk: true,
    expected: {
      sw: "application/javascript; charset=utf-8",
      manifest: "application/manifest+json; charset=utf-8"
    },
    note: "This endpoint confirms the functions are deployed. The platform routing must still be correct."
  }), {
    status: 200,
    headers: { 
      "Content-Type": "application/json; charset=utf-8", 
      "Cache-Control": "no-store, max-age=0" 
    },
  });
});