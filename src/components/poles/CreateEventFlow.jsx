import React from 'react';
import MatchDraftBuilder from './MatchDraftBuilder';

export default function CreateEventFlow({ poleType = "south", prePrize = null, onComplete, onBack }) {
  return (
    <MatchDraftBuilder
      poleType={poleType}
      prePrize={prePrize}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}