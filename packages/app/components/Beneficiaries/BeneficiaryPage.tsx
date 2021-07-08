// Displays a beneficiary or a preview of a proposal

import { BeneficiaryApplication } from '@popcorn/utils';
import VideoSideBar from 'components/CommonComponents/VideoSideBar';
import NavBar from 'components/NavBar/NavBar';
import ImageHeader from '../CommonComponents/ImageHeader';
import ImpactReportLinks from '../CommonComponents/ImpactReportLinks';
import MissionStatement from '../CommonComponents/MissionStatement';
import PhotoSideBar from '../CommonComponents/PhotoSideBar';
import SocialMedia from '../CommonComponents/SocialMedia';
import TriggerTakedownProposal from '../CommonComponents/TriggerTakedownProposal';
import Verification from '../CommonComponents/Verification';

interface BeneficiaryPageProps {
  beneficiary: BeneficiaryApplication;
  isProposalPreview?: boolean;
}

export default function BeneficiaryPage({
  beneficiary,
  isProposalPreview = false,
}: BeneficiaryPageProps): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      {!isProposalPreview && <NavBar />}
      <ImageHeader {...beneficiary} />
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <div className="col-span-2 space-y-4">
          <VideoSideBar {...(beneficiary as BeneficiaryApplication)} />
          <PhotoSideBar {...(beneficiary as BeneficiaryApplication)} />
        </div>
        <MissionStatement missionStatement={beneficiary?.missionStatement} />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mx-48 my-8">
        <Verification {...(beneficiary as BeneficiaryApplication)} />
        <ImpactReportLinks {...beneficiary} />
        <SocialMedia {...beneficiary} />
      </div>
      {!isProposalPreview && <TriggerTakedownProposal />}
    </div>
  );
}
