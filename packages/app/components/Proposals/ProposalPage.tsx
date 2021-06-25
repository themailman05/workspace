import Divider from 'components/CommonComponents/Divider';
import ImageHeader from 'components/CommonComponents/ImageHeader';
import ImpactReportLinks from 'components/CommonComponents/ImpactReportLinks';
import Loading from 'components/CommonComponents/Loading';
import MissionStatement from 'components/CommonComponents/MissionStatement';
import PhotoSideBar from 'components/CommonComponents/PhotoSideBar';
import SocialMedia from 'components/CommonComponents/SocialMedia';
import Verification from 'components/CommonComponents/Verification';
import NavBar from 'components/NavBar/NavBar';
import { Proposal } from 'interfaces/interfaces';
import React from 'react';
import Voting from './Voting/Voting';

export default function ProposalPage(proposal: Proposal): JSX.Element {
  function getContent() {
    return Object.keys(proposal).length === 0 ? (
      <Loading />
    ) : (
      <React.Fragment>
        <ImageHeader {...proposal?.application} />
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
    );
  }
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      <NavBar />
      {getContent()}
    </div>
  );
}
