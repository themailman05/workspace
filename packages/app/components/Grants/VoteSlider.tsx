import { ElectionProps } from 'components/Beneficiaries/BeneficiaryCard';
import { BaseBeneficiary } from 'interfaces/beneficiaries';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useState } from 'react';

interface VoteSlider {
  beneficiary: BaseBeneficiary;
  electionProps: ElectionProps;
}

export default function VoteSlider({
  beneficiary,
  electionProps,
}: VoteSlider): JSX.Element {
  const [votesAssignedByuser, setVotesAssignedByUser] = useState(0);

  const sliderSteps = [
    [0, '0%'],
    [voiceCredits * 0.25, '25%'],
    [voiceCredits * 0.5, '50%'],
    [voiceCredits * 0.75, '75%'],
    [voiceCredits, '100%'],
  ];
  const sliderMarks = {};
  sliderSteps.forEach(function (step) {
    sliderMarks[step[0]] = { style: { color: '#374151' }, label: step[1] };
  });

  function handleSliderChange(value: number) {
    if (voiceCredits - pendingVotes[election.electionTerm].total <= 0) {
      if (
        pendingVotes[election.electionTerm].votes[beneficiary.ethereumAddress] >
        value
      ) {
        setVotesAssignedByUser(value);
        assignVotes(election.electionTerm, {
          address: beneficiary.ethereumAddress,
          votes: value,
        });
      }
      return;
    }
    setVotesAssignedByUser(value);
    assignVotes(election.electionTerm, {
      address: beneficiary.ethereumAddress,
      votes: value,
    });
  }
  if (election.electionStateStringShort !== 'voting') {
    return <></>;
  }

  return (
    <>
      <span className="flex flex-row justify-between">
        <p className="text-lg font-medium text-gray-700">Votes</p>
        <span className="text-base text-gray-700 flex flex-row">
          <p className="font-medium">{totalVotes || 0}</p>
          <p className="mr-4">
            {votesAssignedByuser > 0 && `+${votesAssignedByuser}`}
          </p>
        </span>
      </span>
      {assignVotes && voiceCredits > 0 && (
        <div className="w-11/12 ml-1 pb-3">
          <Slider
            key={beneficiary?.address}
            className="mt-2"
            value={votesAssignedByuser}
            onChange={(value) => handleSliderChange(value)}
            min={0}
            max={voiceCredits}
            step={1}
            marks={sliderMarks}
            dotStyle={{ backgroundColor: '#93C5FD', border: '#93C5FD' }}
            activeDotStyle={{ backgroundColor: '#3B82F6', border: '#3B82F6' }}
            railStyle={{ backgroundColor: '#93C5FD', height: '4px' }}
            trackStyle={{ backgroundColor: '#3B82F6', height: '4px' }}
            /* handleStyle={{
              border: '#F29F05',
              backgroundColor: '#fff',
              height: '14px',
              width: '14px',
            }} */
          />
        </div>
      )}
    </>
  );
}
