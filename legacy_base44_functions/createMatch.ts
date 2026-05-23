import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const matchDetails = await req.json();
        const {
            gameId,
            productId,
            minPlayers,
            maxPlayers,
            buyInCents,
            rules,
            verificationMethod,
            startsAt,
            endsAt
        } = matchDetails;

        if (!gameId || !productId || !minPlayers || !maxPlayers || typeof buyInCents === 'undefined') {
            return Response.json({ error: 'Missing required match details' }, { status: 400 });
        }

        // Create the match in the UserMatch entity
        const newMatch = await base44.entities.UserMatch.create({
            created_by: user.id,
            game_id: gameId,
            product_id: productId,
            min_players: minPlayers,
            max_players: maxPlayers,
            buy_in_cents: buyInCents,
            status: 'open',
            starts_at: startsAt,
            ends_at: endsAt,
            rules: rules,
            verification_method: verificationMethod,
        });

        // Automatically create the first ticket for the match creator
        await base44.entities.Ticket.create({
            match_id: newMatch.id,
            user_id: user.id,
            method: 'paid', // Assume creator pays; could be changed later
        });

        return Response.json({ success: true, match: newMatch });
    } catch (error) {
        console.error("Error in createMatch function:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});