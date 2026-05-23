import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SKILL_COMPETITION_AGREEMENT_VERSION = 'skill_competition_agreement_v1';

export default function SkillCompetitionAgreement({
  accepted,
  onAcceptedChange,
  id = 'skill-competition-agreement',
}) {
  return (
    <section className="rounded-2xl border border-purple-500/30 bg-black/30 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-2 text-purple-200">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Skill-Based Competition Agreement</h3>
          <p className="mt-1 text-sm text-purple-100/75">
            Please read and confirm before entering this match.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-purple-100/85">
        <p>
          By entering this match, you acknowledge that you have spent time, effort, and
          practice developing the skill required to compete.
        </p>
        <p>
          You understand that this is a skill-based competition. The outcome is not based on
          luck or a random drawing. The outcome is determined by the performance, preparation,
          and ability of the players involved.
        </p>

        <div>
          <p className="font-semibold text-white">Why The Poles Exists:</p>
          <p className="mt-1">
            The Poles believes that the work a person puts into mastering themselves should
            carry value. This platform exists to give skilled individuals the opportunity to
            challenge others, prove their ability, and compete for a prize of their choice.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">By continuing, you confirm that:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You are entering voluntarily.</li>
            <li>You understand the rules of the match.</li>
            <li>You believe you possess the skill required to compete.</li>
            <li>You are confident in your ability.</li>
            <li>You accept that the result will be determined by skill-based performance.</li>
          </ul>
        </div>

        <p>
          If you do not feel confident in your ability, we encourage you to continue
          practicing, training, and improving before entering this match.
        </p>
      </div>

      <label
        htmlFor={id}
        className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-purple-400/25 bg-purple-500/10 p-3 text-sm text-white"
      >
        <input
          id={id}
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-purple-300 bg-transparent accent-purple-400"
        />
        <span>
          I confirm that I have confidence in my skill and I am ready to enter this
          skill-based competition.
        </span>
      </label>

      <p className="mt-3 text-xs text-purple-100/60">
        This confirmation records your acceptance of the skill-based competition terms for
        this match.
      </p>
    </section>
  );
}
