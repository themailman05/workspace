import React from 'react';
import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';

import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';
import TakedownChallengePeriodVoting from 'components/Beneficiary-Takedowns/TakedownChallengePeriodVoting';
import TakedownCompletedVoting from 'components/Beneficiary-Takedowns/TakedownCompletedVoting';
import TakedownOpenVoting from 'components/Beneficiary-Takedowns/TakedownOpenVoting';

interface VotingProps {
  displayData: DummyBeneficiaryProposal;
  isTakedown: boolean;
}

function ProposalVoting(displayData: DummyBeneficiaryProposal): JSX.Element {
  return displayData.currentStage === 'Open' ? (
    <OpenVoting {... displayData} />
  ) : displayData.currentStage === 'Challenge' ? (
    <ChallengePeriodVoting {... displayData} />
  ) : (
    <CompletedVoting {... displayData} />
  );
}

function TakedownVoting(displayData: DummyBeneficiaryProposal): JSX.Element {
  return displayData.currentStage === 'Open' ? (
    <TakedownOpenVoting {... displayData} />
  ) : displayData.currentStage === 'Challenge' ? (
    <TakedownChallengePeriodVoting {... displayData} />
  ) : (
    <TakedownCompletedVoting {... displayData} />
  );
}

export default function Voting({ displayData, isTakedown }: VotingProps) {
  return (
    <div>
      {isTakedown ? (
        <TakedownVoting {...displayData} />
      ) : (
        <ProposalVoting {...displayData} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
