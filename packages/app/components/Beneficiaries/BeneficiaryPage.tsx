import TriggerTakedownProposal from 'components/Beneficiaries/TriggerTakedownProposal';
import NavBar from 'components/NavBar/NavBar';
import { Beneficiary, BeneficiaryProposal } from 'interfaces/beneficiaries';
import ImageHeader from './ImageHeader';
import ImpactReportLinks from './ImpactReportLinks';
import MissionStatement from './MissionStatement';
import PhotoSideBar from './PhotoSideBar';
import Voting from './Proposals/Voting/Voting';
import SocialMedia from './SocialMedia';
import Verification from './Verification';

interface BeneficiaryPageProps {
  displayData: Beneficiary | BeneficiaryProposal;
  isProposal?: boolean;
  isProposalPreview?: boolean;
  isTakedown?: boolean;
}

export default function BeneficiaryPage({
  displayData,
  isProposal = false,
  isProposalPreview = false,
  isTakedown = false,
}: BeneficiaryPageProps): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      {!isProposalPreview && <NavBar />}
      <ImageHeader {...displayData} />
      {isProposal && (
        <Voting
          displayData={displayData as BeneficiaryProposal}
          isTakedown={isTakedown}
        />
      )}
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <PhotoSideBar {...(displayData as BeneficiaryProposal)} />
        <MissionStatement missionStatement={displayData?.missionStatement} />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mx-48 my-8">
        <Verification {...(displayData as BeneficiaryProposal)} />
        <ImpactReportLinks {...displayData} />
        <SocialMedia {...displayData} />
      </div>
      {!isProposal && !isProposalPreview && <TriggerTakedownProposal />}
    </div>
  );
}
