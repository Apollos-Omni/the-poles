import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, QrCode, Users } from "lucide-react";

export default function SPSharePanel({ challenge }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/SouthPoleChallenge?id=${challenge.id}`;
  const socialText = `🏆 Join my South Pole Challenge!\n\n"${challenge.title}"\nPrize: ${challenge.prize_title}\n\nCompete. Win. Experience it.\n\n${url}`;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spotsLeft = Math.max(0, (challenge.num_participants_needed || 0) - (challenge.current_participants || 0));

  return (
    <div className="bg-black/30 border border-cyan-700/30 rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2"><Share2 className="w-4 h-4 text-cyan-400" /> Promote Your Challenge</h3>

      <div className="bg-cyan-900/20 border border-cyan-700/20 rounded-lg p-3 text-xs text-cyan-300/80 space-y-1">
        <div className="flex items-center gap-2 font-medium text-cyan-200">
          <Users className="w-4 h-4" />
          {spotsLeft > 0
            ? `Needs ${spotsLeft} more competitor${spotsLeft !== 1 ? "s" : ""} to launch!`
            : "🎉 Full! Ready to compete."}
        </div>
      </div>

      <div>
        <p className="text-xs text-purple-300/60 mb-1">Challenge Link</p>
        <div className="flex gap-2">
          <input readOnly value={url} className="flex-1 bg-black/40 border border-cyan-700/30 rounded-lg px-3 py-2 text-xs text-cyan-300 min-w-0" />
          <Button size="sm" variant="outline" onClick={() => copy(url)} className="border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/30 shrink-0">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs text-purple-300/60 mb-1">Social Media Text</p>
        <textarea readOnly value={socialText} rows={4}
          className="w-full bg-black/40 border border-cyan-700/30 rounded-lg px-3 py-2 text-xs text-purple-200/80 resize-none" />
        <Button size="sm" variant="outline" onClick={() => copy(socialText)} className="mt-1 border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/30 text-xs">
          {copied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy Social Text</>}
        </Button>
      </div>

      <div className="bg-black/20 border border-dashed border-cyan-700/30 rounded-lg p-4 text-center">
        <QrCode className="w-8 h-8 text-cyan-500/40 mx-auto mb-2" />
        <p className="text-xs text-cyan-400/50">QR Code generation coming soon</p>
        <p className="text-xs text-purple-400/40">Share in-person with a scannable code</p>
      </div>
    </div>
  );
}