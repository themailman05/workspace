import NavBar from 'components/NavBar/NavBar';
import ImageHeader from 'components/ImageHeader';
import ImpactReportLinks from 'components/ImpactReportLinks';
import PhotoSideBar from 'components/PhotoSideBar';
import MissionStatement from 'components/MissionStatement';
import SocialMediaLinks from 'components/SocialMediaLinks';
import Verification from 'components/Verification';
import TriggerTakedownProposal from 'components/Beneficiaries/TriggerTakedownProposal';
import {
  beneficiaryProposalFixture as beneficiaryProposal,
  beneficiaryProposalFixture,
} from '../fixtures/beneficiaryProposals';
import {
  Beneficiary,
  DummyBeneficiaryProposal,
} from 'interfaces/beneficiaries';
import SocialMedia from './SocialMedia';
import Voting from './Beneficiary-Proposals/Voting';

interface BeneficiaryPageProps {
  isProposal: boolean;
  isProposalPreview?: boolean;
  displayData?: Beneficiary | DummyBeneficiaryProposal;
  isTakedown: boolean;
}

export default function BeneficiaryPage({
  isProposal,
  isProposalPreview = false,
  displayData,
  isTakedown = false,
}: BeneficiaryPageProps): JSX.Element {
  displayData = beneficiaryProposalFixture;
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      {!isProposalPreview && <NavBar />}
      <ImageHeader {...displayData} />
      {isProposal && (
        <Voting
          displayData={displayData as DummyBeneficiaryProposal}
          isTakedown={isTakedown}
        />
      )}
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <PhotoSideBar {...(displayData as DummyBeneficiaryProposal)} />
        <MissionStatement missionStatement={displayData?.missionStatement} />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mx-48 my-8">
        <Verification {...(displayData as DummyBeneficiaryProposal)} />
        <ImpactReportLinks {...displayData} />
        <SocialMedia {...displayData} />
      </div>
      {!isProposal && <TriggerTakedownProposal />}
    </div>
  );
}
