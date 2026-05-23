import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { createHash } from "https://deno.land/std@0.108.0/hash/mod.ts";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { matchId, score, proofMeta } = body;

        if (!matchId || typeof score !== 'number' || !proofMeta) {
            return Response.json({ error: 'Missing required fields: matchId, score, proofMeta' }, { status: 400 });
        }

        const ticket = (await base44.entities.Ticket.filter({ match_id: matchId, user_id: user.id }))[0];
        if (!ticket) {
            return Response.json({ error: 'Not a participant in this match' }, { status: 403 });
        }

        const match = (await base44.entities.UserMatch.filter({ id: matchId }))[0];
        if (!match || (match.status !== 'active' && match.status !== 'judging')) {
            return Response.json({ error: 'Match is not active or in judging phase' }, { status: 400 });
        }
        
        const proofString = JSON.stringify(proofMeta);
        const hash = createHash("sha256");
        hash.update(proofString);
        const proofHash = hash.toString();

        const newScore = await base44.entities.Score.create({
            match_id: matchId,
            user_id: user.id,
            score: score,
            meta_json: proofMeta,
            proof_hash: proofHash
        });

        await base44.entities.AuditEvent.create({
            actor: `user:${user.id}`,
            stage: 'SCORE_SUBMIT',
            message: `User submitted score of ${score} for match ${matchId}`,
            meta: { matchId, score, proofHash }
        });

        return Response.json({ success: true, score: newScore });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});