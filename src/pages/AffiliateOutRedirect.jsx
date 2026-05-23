import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { affiliateRedirect } from "@/functions/affiliateRedirect";

export default function AffiliateOutRedirect() {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!offerId) return;
    affiliateRedirect({ offerId, sourcePage: document.referrer || "direct" })
      .then(res => {
        setOffer(res.data);
        // Count down before auto-redirect
        let c = 5;
        const timer = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) {
            clearInterval(timer);
            window.location.href = res.data.affiliate_url;
          }
        }, 1000);
        return () => clearInterval(timer);
      })
      .catch(err => setError(err.message || "Offer not found"));
  }, [offerId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <h1 className="text-2xl font-bold">Link Unavailable</h1>
          <p className="text-purple-300/60">{error}</p>
          <Link to="/ThePoles"><Button variant="outline" className="border-purple-700/40 text-purple-300">Back to The Poles</Button></Link>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
          <p className="text-purple-300/60">Loading offer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">

        <div className="space-y-2">
          <div className="text-5xl">🛍️</div>
          <h1 className="text-2xl font-black text-white">You're leaving The Poles</h1>
          <p className="text-purple-300/70 text-sm">You're being redirected to <strong className="text-white">{offer.merchant}</strong></p>
        </div>

        {/* Product info */}
        <div className="bg-black/40 border border-purple-700/20 rounded-2xl p-5 space-y-2 text-left">
          <p className="text-xs text-purple-400/60 uppercase tracking-wide">Product</p>
          <p className="font-semibold text-white">{offer.title}</p>
          <p className="text-xs text-purple-300/60">Retailer: {offer.merchant}</p>
          <p className="text-xs text-yellow-400/80 leading-relaxed mt-2">
            ⚠️ {offer.disclosure_text}
          </p>
        </div>

        {/* Countdown */}
        <div className="space-y-3">
          <p className="text-purple-300/60 text-sm">Auto-redirecting in <strong className="text-white">{countdown}</strong> seconds...</p>
          <Button
            className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            onClick={() => { window.location.href = offer.affiliate_url; }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to {offer.merchant} Now
          </Button>
          <Link to="/ThePoles" className="block text-xs text-purple-400/60 hover:text-purple-300">
            ← Cancel and go back
          </Link>
        </div>

      </div>
    </div>
  );
}