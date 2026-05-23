import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        const agentDoctorSh = `#!/usr/bin/env bash
set -euo pipefail

API1=\${API1:-http://localhost:4001}   # PLUS API
API2=\${API2:-http://localhost:4002}   # Agent/Audit API (optional add-on)
DB=\${DB:-heavenly}

echo "== Agent Doctor =="
echo "API1=$API1"
echo "API2=$API2"
echo "DB=$DB"
echo

function ping() {
  local url="$1"
  if curl -fsS "$url" >/dev/null; then
    echo "OK  $url"
  else
    echo "ERR $url"
  fi
}

echo "-- Health checks --"
ping "$API1/health" || true
ping "$API2/health" || true
echo

echo "-- Route smoke (resolve & agent) --"
echo "POST /v1/resolve/amazon"
curl -sS -X POST "$API1/v1/resolve/amazon" \\
  -H 'content-type: application/json' \\
  -d '{"url":"https://www.amazon.com/dp/B00PLACEHOLDER"}' | sed 's/{"enabled":/{"enabled":/'
echo

echo "POST /v1/agent/fulfill (simulator path)"
curl -sS -X POST "$API1/v1/agent/fulfill" \\
  -H 'content-type: application/json' \\
  -d '{"matchId":"00000000-0000-0000-0000-000000000000","productUrl":"https://www.amazon.com/dp/B00PLACEHOLDER","retailer":"amazon","title":"Demo","priceCents":1999}' || true
echo

echo "-- Audit log endpoints (if pack installed on :4002) --"
curl -sS "$API2/v1/audit/events" | head -c 500 || echo "No audit API on :4002"
echo -e "\\n"

echo "-- Verify DB tables (psql needed) --"
if command -v psql >/dev/null 2>&1; then
  psql -d "$DB" -Atxc "
    select 'matches' as t, count(*) from information_schema.tables where table_name='matches';
    select 'audit_events' as t, count(*) from information_schema.tables where table_name='audit_events';
    select 'user_profiles' as t, count(*) from information_schema.tables where table_name='user_profiles';
  " || true
else
  echo "psql not found; skipping DB checks."
fi

echo
echo "Done. If /v1/resolve/amazon or /v1/agent/fulfill returned 404, your routes probably aren't mounted in api/src/index.ts."
`;

        const sqlAgentSanitySql = `-- Check presence of key tables/views
select table_name from information_schema.tables where table_schema='public' and table_name in
('matches','products','fulfillments','audit_events','payments','issuer_cards','deliveries','user_profiles','user_stats','behavior_events');

-- Recent audit events (if audit_events exists)
select * from audit_events order by created_at desc limit 20;

-- Any matches stuck in 'finalized' without fulfillment
select id, status from matches where status='finalized' and id not in (select match_id from fulfillments);
`;

        const agentSmoketestHttp = `# Base URLs (adjust if needed)
# @api1 = http://localhost:4001
# @api2 = http://localhost:4002

### Resolve a demo Amazon URL (should upsert a product)
POST {{api1}}/v1/resolve/amazon
content-type: application/json

{
  "url": "https://www.amazon.com/dp/B00PLACEHOLDER"
}

### Kick the agent on :4001 (simulator purchase)
POST {{api1}}/v1/agent/fulfill
content-type: application/json

{
  "matchId": "00000000-0000-0000-0000-000000000000",
  "productUrl": "https://www.amazon.com/dp/B00PLACEHOLDER",
  "retailer": "amazon",
  "title": "Demo",
  "priceCents": 1999
}

### (If you installed the audit add-on) View audit stream
GET {{api2}}/v1/audit/events
`;

        const zip = new JSZip();
        zip.file("agent_doctor.sh", agentDoctorSh, { unixPermissions: "755" });
        zip.file("sql_agent_sanity.sql", sqlAgentSanitySql);
        zip.file("agent_smoketest.http", agentSmoketestHttp);

        const content = await zip.generateAsync({ type: "uint8array" });

        return new Response(content, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="agent_doctor.zip"',
            },
        });

    } catch (error) {
        console.error("Error generating agent toolkit:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});