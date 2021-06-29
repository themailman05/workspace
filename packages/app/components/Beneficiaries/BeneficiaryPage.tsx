// Displays a beneficiary or a preview of a proposal

import NavBar from 'components/NavBar/NavBar';
import ImageHeader from '../CommonComponents/ImageHeader';
import ImpactReportLinks from '../CommonComponents/ImpactReportLinks';
import MissionStatement from '../CommonComponents/MissionStatement';
import PhotoSideBar from '../CommonComponents/PhotoSideBar';
import SocialMedia from '../CommonComponents/SocialMedia';
import Verification from '../CommonComponents/Verification';
import TriggerTakedownProposal from '../CommonComponents/TriggerTakedownProposal';
import { BeneficiaryApplication } from '@popcorn/utils';

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
        <PhotoSideBar {...(beneficiary as BeneficiaryApplication)} />
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
