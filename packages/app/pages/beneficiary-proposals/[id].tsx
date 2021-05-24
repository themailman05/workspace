// TODO: Source social data from beneficiary object
import React from 'react';

import NavBar from '../../components/NavBar/NavBar';
import ChallengePeriodVoting from 'components/Beneficiary-Proposals/ChallengePeriodVoting';
import CompletedVoting from 'components/Beneficiary-Proposals/CompletedVoting';
import ImageHeader from 'components/ImageHeader';
import ImpactReportLinks from 'components/ImpactReportLinks';
import OpenVoting from 'components/Beneficiary-Proposals/OpenVoting';
import PhotoSideBar from 'components/PhotoSideBar';
import SocialMediaLinks from 'components/SocialMediaLinks';
import Verification from 'components/Verification';

import { beneficiaryProposalFixture as beneficiaryProposal } from '../../fixtures/beneficiaryProposals';

export default function BeneficiaryPage(): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full pb-16 ">
      <NavBar />
      <ImageHeader {...beneficiaryProposal} />
      {beneficiaryProposal.currentStage === 'Open' ? (
        <OpenVoting {...beneficiaryProposal} />
      ) : beneficiaryProposal.currentStage === 'Challenge' ? (
        <ChallengePeriodVoting {...beneficiaryProposal} />
      ) : (
        <CompletedVoting {...beneficiaryProposal} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4 space-x-12 mx-48 my-8">
        <PhotoSideBar {...beneficiaryProposal} />
        <div className="col-span-6 space-y-4">
          <p className="text-3xl text-black sm:text-4xl lg:text-5xl">
            Mission Statement
          </p>
          <p className="max-w-4xl text-xl text-black sm:text-2xl">
            {beneficiaryProposal.missionStatement}
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
      <div className="gap-4 space-x-12 mx-48 my-8">
        <Verification {...beneficiaryProposal} />
        <ImpactReportLinks {...beneficiaryProposal} />
        <SocialMediaLinks {...beneficiaryProposal} />
      </div>
    </div>
  );
}
