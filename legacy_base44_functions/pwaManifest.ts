Deno.serve((req) => {
  console.log('Manifest function called:', req.url);
  
  const manifestData = {
    name: "DivineHinge",
    short_name: "Hinge",
    description: "Secure IoT door control system with divine vision tracking",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#8B5CF6",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%238B5CF6"/><text y="50%" x="50%" font-size="60" text-anchor="middle" alignment-baseline="middle" fill="white">DH</text></svg>',
        sizes: '192x192',
        type: 'image/svg+xml'
      },
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%238B5CF6"/><text y="50%" x="50%" font-size="60" text-anchor="middle" alignment-baseline="middle" fill="white">DH</text></svg>',
        sizes: '512x512',
        type: 'image/svg+xml'
      }
    ]
  };

  return new Response(JSON.stringify(manifestData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    },
  });
});