import NavBar from 'components/NavBar/NavBar';
import ImageHeader from 'components/ImageHeader';
import ImpactReportLinks from 'components/ImpactReportLinks';
import PhotoSideBar from 'components/PhotoSideBar';
import MissionStatement from 'components/MissionStatement';
import SocialMediaLinks from 'components/SocialMediaLinks';
import Verification from 'components/Verification';
import TriggerTakedownProposal from 'components/Beneficiaries/TriggerTakedownProposal';
import { beneficiaryProposalFixture as beneficiaryProposal } from '../fixtures/beneficiaryProposals';
import { DummyBeneficiaryProposal } from 'interfaces/beneficiaries';

interface Props {
  isProposal: boolean,
  beneficiaryProposal?: DummyBeneficiaryProposal
  isProposalPreview?: boolean;
}

const defaultProps: Props = {
  isProposal: true,
  beneficiaryProposal: beneficiaryProposal,
  isProposalPreview: false
}
export default function BeneficiaryPage<Props>({ isProposal, beneficiaryProposal, isProposalPreview }): JSX.Element {
  console.log({beneficiaryProposal});
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      {!isProposalPreview ? <NavBar /> : <div></div>}
      <ImageHeader {...beneficiaryProposal} />
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <PhotoSideBar {...beneficiaryProposal} />
        <MissionStatement {...beneficiaryProposal} />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mx-48 my-8">
        <Verification {...beneficiaryProposal} />
        <ImpactReportLinks {...beneficiaryProposal} />
        <SocialMediaLinks {...beneficiaryProposal} />
      </div>
      {!isProposal ? <TriggerTakedownProposal /> : <div></div>}
    </div>
  );
}

BeneficiaryPage.defaultProps = defaultProps;
