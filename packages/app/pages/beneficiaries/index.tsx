import React, { useContext, useState } from 'react';
import { store } from '../../context/store';
import NavBar from '../../components/NavBar/NavBar';
import BeneficiaryCard from 'components/Beneficiaries/BeneficiaryCard';

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
            A list of beneficiary organizations that have passed the voting
            process and are eligible to receive grants
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center justify-start ml-36 mr-64 my-4 h-1/2">
        <div className="relative text-gray-600 focus-within:text-gray-400 ">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <svg
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <div className="mt-1 ">
            <input
              type="search"
              name="searchfilterÍ"
              className="py-2 text-xl text-black bg-white rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
              placeholder="Search Eligible Beneficiaries"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            ></input>
          </div>
        </div>
      </div>
      <ul className="sm:grid sm:grid-cols-2 gap-x-2 gap-y-12 lg:grid-cols-3 mx-36">
        {beneficiaryProposalFixtures.map((beneficiaryProposal) => (
          <BeneficiaryCard
            key={beneficiaryProposal.stageDeadline.toString()}
            {...beneficiaryProposal}
          />
        ))}
      </ul>
    </div>
  );
}
