import ImageHeader from 'components/CommonComponents/ImageHeader';
import ImpactReportLinks from 'components/CommonComponents/ImpactReportLinks';
import MissionStatement from 'components/CommonComponents/MissionStatement';
import PhotoSideBar from 'components/CommonComponents/PhotoSideBar';
import SocialMedia from 'components/CommonComponents/SocialMedia';
import Verification from 'components/CommonComponents/Verification';
import NavBar from 'components/NavBar/NavBar';
import { Proposal, ProposalType } from 'interfaces/proposals';
import Voting from './Voting/Voting';

interface ProposalPageProps {
  proposal: Proposal;
  proposalType: ProposalType;
}

export default function ProposalPage({
  proposal,
  proposalType = "Nomination",
}: ProposalPageProps): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      <NavBar />
      <ImageHeader {...proposal} />
      <Voting
        proposal={proposal as Proposal}
        proposalType={proposalType}
      />
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <PhotoSideBar {...(proposal as Proposal)} />
        <MissionStatement missionStatement={proposal?.missionStatement} />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="mx-48 my-8">
        <Verification {...(proposal as Proposal)} />
        <ImpactReportLinks {...proposal} />
        <SocialMedia {...proposal} />
      </div>
    </div>
  );
}
