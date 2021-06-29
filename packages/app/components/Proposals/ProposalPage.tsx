import { ContractsContext } from 'context/Web3/contracts';
import { useContext, useEffect, useState } from 'react';
import Divider from 'components/CommonComponents/Divider';
import ImageHeader from 'components/CommonComponents/ImageHeader';
import ImpactReportLinks from 'components/CommonComponents/ImpactReportLinks';
import Loading from 'components/CommonComponents/Loading';
import MissionStatement from 'components/CommonComponents/MissionStatement';
import PhotoSideBar from 'components/CommonComponents/PhotoSideBar';
import SocialMedia from 'components/CommonComponents/SocialMedia';
import Verification from 'components/CommonComponents/Verification';
import NavBar from 'components/NavBar/NavBar';
import {
  BeneficiaryGovernanceAdapter,
  IpfsClient,
  Proposal,
} from '@popcorn/utils/';
import React from 'react';
import Voting from './Voting/Voting';
import { useRouter } from 'next/router';

export default function ProposalPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal>();
  const [proposalId, setProposalId] = useState<string>();
  useEffect(() => {
    const { id } = router.query;
    if (id && id !== proposalId) setProposalId(id as string);
  }, [router, proposalId]);
  useEffect(() => {
    if (contracts?.beneficiaryGovernance && proposalId) {
      BeneficiaryGovernanceAdapter(contracts.beneficiaryGovernance, IpfsClient)
        .getProposal(proposalId)
        .then((res) => setProposal(res));
    }
  }, [contracts, proposalId]);
  function getContent() {
    return proposalId !== undefined &&
      proposal !== undefined &&
      Object.keys(proposal).length > 0 ? (
      <React.Fragment>
        <ImageHeader {...proposal} />
        <Voting {...proposal} />
        <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
          <PhotoSideBar {...proposal?.application} />
          <MissionStatement
            missionStatement={proposal?.application?.missionStatement}
          />
        </div>
        <Divider />
        <div className="mx-48 my-8">
          <Verification {...proposal?.application} />
          <ImpactReportLinks {...proposal?.application} />
          <SocialMedia {...proposal?.application} />
        </div>
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      <NavBar />
      {getContent()}
    </div>
  );
}
