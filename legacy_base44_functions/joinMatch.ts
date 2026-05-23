import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { matchId, method = 'paid' } = await req.json();

        if (!matchId) {
            return Response.json({ error: 'Match ID is required' }, { status: 400 });
        }

        const match = (await base44.entities.UserMatch.filter({ id: matchId }))[0];

        if (!match) {
            return Response.json({ error: 'Match not found' }, { status: 404 });
        }
        
        if (match.status !== 'open') {
            return Response.json({ error: 'Match is not open for joining' }, { status: 400 });
        }

        // Check if user already joined
        const existingTicket = (await base44.entities.Ticket.filter({ match_id: matchId, user_id: user.id }))[0];
        if (existingTicket) {
            return Response.json({ error: 'You have already joined this match' }, { status: 400 });
        }
        
        const tickets = await base44.entities.Ticket.filter({ match_id: matchId });
        if (tickets.length >= match.max_players) {
             return Response.json({ error: 'This match is already full' }, { status: 400 });
        }

        // TODO: Handle payment processing for 'paid' method

        const newTicket = await base44.entities.Ticket.create({
            match_id: matchId,
            user_id: user.id,
            method: method
        });

        // If the match is now full, change its status to 'active'
        if (tickets.length + 1 >= match.max_players) {
            await base44.entities.UserMatch.update(matchId, { status: 'active' });
        }

        return Response.json({ success: true, ticket: newTicket });
    } catch (error) {
        console.error("Error in joinMatch function:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});