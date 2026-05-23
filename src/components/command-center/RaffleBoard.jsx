
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Eye, AlertCircle } from "lucide-react";

const statusColors = {
  "DRAFT": "bg-gray-100 text-gray-800",
  "OPEN": "bg-green-100 text-green-800",
  "LOCKED": "bg-yellow-100 text-yellow-800",
  "DRAWING": "bg-blue-100 text-blue-800",
  "COMPLETED": "bg-purple-100 text-purple-800",
  "VOID": "bg-red-100 text-red-800"
};

export function RaffleBoard({ api }) {
  const [raffles, setRaffles] = useState([]);
  const [proof, setProof] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    (async () => {
      try {
        setRaffles(await api.list());
        setErr(null);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const reveal = async (rid) => {
    try {
      setProof(await api.reveal(rid));
      setErr(null);
    } catch (e) {
      setErr(String(e.message || e));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8 text-purple-300">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      <span className="ml-3">Loading raffles...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {err && (
        <div className="flex items-center gap-2 p-4 bg-red-900/40 text-red-300 rounded-lg border border-red-700/50">
          <AlertCircle className="w-5 h-5" />
          <span>{err}</span>
        </div>
      )}

      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Active Raffles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!raffles.length ? (
            <div className="text-center py-8 text-purple-300/70">
              <Gift className="w-16 h-16 mx-auto mb-4" />
              <p>No active raffles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {raffles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 border border-purple-700/30 bg-black/20 rounded-lg backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-purple-200">{r.title}</h3>
                    {r.description && (
                      <p className="text-sm text-purple-300/80 mt-1">{r.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-purple-200 border-purple-600">
                      {r.status}
                    </Badge>
                    {(r.status === "DRAWING" || r.status === "LOCKED") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reveal(r.id)}
                        className="text-purple-200 border-purple-600 hover:bg-purple-700/40 hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Reveal
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {proof && (
        <Card className="bg-black/20 backdrop-blur-sm border border-purple-700/30">
          <CardHeader>
            <CardTitle className="text-purple-200">Raffle Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs p-3 bg-black/40 rounded overflow-x-auto text-purple-300">
              {JSON.stringify(proof, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
