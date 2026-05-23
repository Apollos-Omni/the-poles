Deno.serve((req) => {
  // Helper functions (inlined)
  const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/manifest+json; charset=utf-8", ...extra },
  });

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: { 'Allow': 'GET, HEAD' } 
    });
  }

  const MANIFEST = {
    name: "DivineHinge",
    short_name: "Hinge",
    description: "Divine connections through sacred thresholds",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#000000",
    theme_color: "#8B5CF6",
    scope: "/",
    icons: [
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="%238B5CF6"/><text y="50%" x="50%" font-size="120" text-anchor="middle" alignment-baseline="middle" fill="white">DH</text></svg>',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="%238B5CF6"/><text y="50%" x="50%" font-size="320" text-anchor="middle" alignment-baseline="middle" fill="white">DH</text></svg>',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ],
    categories: ["productivity", "social", "lifestyle"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Home",
        description: "Open Dashboard",
        url: "/",
        icons: [{ src: "/icons/home-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Visions",
        short_name: "Visions",
        description: "Track Your Visions",
        url: "/VisionTracker",
        icons: [{ src: "/icons/vision-96x96.png", sizes: "96x96" }]
      }
    ]
  };

  const headers = {
    "cache-control": "no-store, max-age=0"
  };

  if (req.method === "HEAD") {
    return new Response("", { headers: { ...headers, "content-type": "application/manifest+json; charset=utf-8" } });
  }

  return json(MANIFEST, 200, headers);
});