import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // This is an admin/system-level function, so we use asServiceRole
        
        const { matchId } = await req.json();
        if (!matchId) {
            return Response.json({ error: 'Match ID required' }, { status: 400 });
        }

        const match = (await base44.asServiceRole.entities.UserMatch.filter({ id: matchId }))[0];
        if (!match) {
            return Response.json({ error: 'Match not found' }, { status: 404 });
        }

        if (match.status !== 'judging') {
            return Response.json({ error: 'Match must be in "judging" state to be finalized.' }, { status: 400 });
        }
        
        // Get all scores for the match
        const scores = await base44.asServiceRole.entities.Score.filter({ match_id: matchId });
        if (scores.length === 0) {
            return Response.json({ error: 'No scores submitted for this match' }, { status: 400 });
        }

        // Sort scores descending to find the winner
        scores.sort((a, b) => b.score - a.score);

        // Create leaderboard entries
        const leaderboardEntries = scores.map((score, index) => ({
            match_id: matchId,
            user_id: score.user_id,
            total_score: score.score,
            rank: index + 1,
        }));
        await base44.asServiceRole.entities.Leaderboard.bulkCreate(leaderboardEntries);
        
        const winner = scores[0];

        // Update match with winner and set status to completed
        await base44.asServiceRole.entities.UserMatch.update(matchId, {
            status: 'completed',
            winners: [winner.user_id],
        });

        // Trigger fulfillment process
        await base44.asServiceRole.entities.Fulfillment.create({
            match_id: matchId,
            winner_id: winner.user_id,
            mode: 'agent', // Default to agent fulfillment
            status: 'pending',
        });
        
        return Response.json({ success: true, winner_id: winner.user_id });
    } catch (error) {
        console.error("Error in finalizeMatch function:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});