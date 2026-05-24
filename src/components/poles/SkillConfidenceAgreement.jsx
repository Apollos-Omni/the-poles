import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

export default function SkillConfidenceAgreement({ open, onConfirm, onCancel }) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl bg-black/95 border border-purple-700/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">Skill-Based Competition Agreement</DialogTitle>
          <DialogDescription className="text-purple-300/70">Please read and confirm before entering this match</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
          {/* Main purpose statement */}
          <div className="space-y-3">
            <p className="text-purple-200/80 leading-relaxed">
              By entering this match, you acknowledge that you have spent time, effort, and practice developing the skill required to compete.
            </p>
            <p className="text-purple-200/80 leading-relaxed">
              You understand that this is a <strong>skill-based competition</strong>. The outcome is not based on chance or luck. The outcome is determined by the performance, preparation, and ability of the players involved.
            </p>
          </div>

          {/* Platform belief */}
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-purple-300">Why The Poles Exists</h3>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              The Poles believes that the work a person puts into mastering themselves should carry value. This platform exists to give skilled individuals the opportunity to challenge others, prove their ability, and compete for a prize of their choice.
            </p>
          </div>

          {/* Confirmations required */}
          <div className="space-y-3 bg-black/40 border border-purple-700/20 rounded-xl p-4">
            <h3 className="font-semibold text-purple-300 text-sm">By continuing, you confirm that:</h3>
            <ul className="space-y-2 text-sm text-purple-200/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 font-bold">✓</span>
                <span>You are entering voluntarily.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 font-bold">✓</span>
                <span>You understand the rules of the match.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 font-bold">✓</span>
                <span>You believe you possess the skill required to compete.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 font-bold">✓</span>
                <span>You are confident in your ability.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 font-bold">✓</span>
                <span>You accept that the result will be determined by skill-based performance.</span>
              </li>
            </ul>
          </div>

          {/* Encouragement if not ready */}
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-200/80 text-sm leading-relaxed">
              If you do not feel confident in your ability, we encourage you to continue practicing, training, and improving before entering this match.
            </p>
          </div>
        </div>

        {/* Checkbox and buttons */}
        <div className="space-y-4 pt-4 border-t border-purple-700/20">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={checked}
              onCheckedChange={setChecked}
              className="mt-1"
            />
            <span className="text-sm text-purple-200/80">
              I confirm that I have confidence in my skill and I am ready to enter this skill-based competition.
            </span>
          </label>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              className="border-purple-700/30 text-purple-300 hover:bg-purple-900/20"
              onClick={onCancel}
            >
              Back
            </Button>
            <Button
              className="bg-purple-700 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!checked}
              onClick={() => onConfirm()}
            >
              Enter Skill-Based Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
