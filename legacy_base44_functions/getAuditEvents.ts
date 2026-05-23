import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let limit = 50;
        // This is a much more robust way to handle an optional JSON body.
        // It checks the method and content-type, and reads the body as text first.
        if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
            const bodyText = await req.text();
            if (bodyText) { // Only try to parse if the body is not empty
                try {
                    const body = JSON.parse(bodyText);
                    if (body && typeof body.limit === 'number') {
                        // Sanitize the limit to prevent fetching too much data
                        limit = Math.min(Math.max(body.limit, 1), 500);
                    }
                } catch (e) {
                    console.log('Could not parse request body, using default limit.');
                }
            }
        }

        const events = await base44.asServiceRole.entities.AuditEvent.list('-created_date', limit);

        // Ensure events is always an array
        return Response.json({ success: true, events: events || [] });

    } catch (error) {
        console.error("Critical error in getAuditEvents:", error.message, error.stack);
        // This catch block is critical. It guarantees a valid JSON response is sent
        // even if the function crashes unexpectedly.
        return new Response(JSON.stringify({ success: false, error: error.message, events: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});