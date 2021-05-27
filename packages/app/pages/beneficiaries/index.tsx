import React, { useContext, useState } from 'react';
import { store } from '../../context/store';
import NavBar from '../../components/NavBar/NavBar';
import BeneficiaryCard from 'components/BeneficiaryCard';
import * as Icon from 'react-feather';

import { beneficiaryProposalFixtures } from '../../fixtures/beneficiaryProposals';

export default function AllBeneficiaryProposals() {
  const { dispatch } = useContext(store);
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <div className="w-full bg-gray-900 pb-16">
      <NavBar />
      <div className="pt-12 px-4 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
        <div className="text-center">
          <p className="mt-2 text-3xl text-indigo-900 sm:text-4xl lg:text-5xl">
            Eligible Beneficiaries
          </p>
          <p className="mt-3 max-w-4xl mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            Beneficiary organizations that have passed the voting process and
            are eligible to receive grants
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center justify-start ml-36 mr-64 my-4 h-1/2">
        <div className="relative text-gray-600 focus-within:text-gray-400 ">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Icon.Search className="mr-4" />
          </span>
          <div className="mt-1 ">
            <input
              type="search"
              name="searchfilter"
              className="py-2 w-full text-xl text-black bg-white rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
              placeholder="Search Eligible Beneficiaries"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            ></input>
          </div>
        </div>
      </div>
      <ul className="sm:grid sm:grid-cols-2 gap-x-2 gap-y-12 lg:grid-cols-3 mx-36">
        {beneficiaryProposalFixtures.map((beneficiaryProposal) => {
          let isProposal = { isProposal: false };
          return (
            <BeneficiaryCard
              key={beneficiaryProposal.stageDeadline.toString()}
              beneficiaryProposal={beneficiaryProposal}
              isProposal={false}
            />
          );
        })}
      </ul>
    </div>
  );
}
