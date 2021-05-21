import React, { useContext, useState } from 'react';
import { store } from 'app/store';
import NavBar from '../../containers/NavBar/NavBar';
import { setSingleActionModal } from '../../app/actions';
import BeneficiaryCard from 'components/Beneficiaries/BeneficiaryCard';

import { DummyBeneficiary } from './interfaces';

const DUMMY_BENEFICIARY_DATA: DummyBeneficiary[] = new Array(20)
  .fill(undefined)
  .map(() => {
    return {
      name: 'Room to Read',
      missionStatement:
        'Room to Read seeks to transform the lives of millions of children in low-income communities by focusing on literacy and gender equality in education.',
      profileImageURL: 'https://i.ytimg.com/vi/JpyeZ6BcslA/maxresdefault.jpg',
      twitterUrl: '#',
      linkedinUrl: '#',
      ethereumAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      headerImageURL:
    'https://pbs.twimg.com/profile_banners/64823914/1591143684/600x200',
    };
  });

export default function AllBeneficiaries() {
  const { dispatch } = useContext(store);
  const [searchFilter, updateSearchFilter] = useState('');

  const openModal = () => {
    dispatch(
      setSingleActionModal({
        title: 'Success!',
        content: 'You have successfully voted in this election. Thank you!',
        visible: true,
        onConfirm: {
          label: 'Close',
          onClick: () => {
            dispatch(setSingleActionModal(false));
          },
        },
      }),
    );
  };

  return (
    <div className="w-full bg-gray-900 pb-16">
      <NavBar />
      <div className="pt-12 px-4 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
        <div className="text-center">
          <h2 className="text-lg leading-6 font-semibold text-indigo-900 uppercase tracking-wider"></h2>
          <p className="mt-2 text-3xl font-extrabold text-indigo-900 sm:text-4xl lg:text-5xl">
            Eligible Beneficiaries
          </p>
          <p className="mt-3 max-w-4xl mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            Here you'll find beneficiary organizations that have passed the
            voting process and are eligible to receive grants
          </p>
        </div>
      </div>

      <div className="flex items-center justify-start mx-10 my-4 h-1/2">
        <div className="relative text-gray-600 focus-within:text-gray-400">
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
          <div className="mt-1">
            <input
              type="search"
              name="searchfilterÍ"
              className="py-2 text-xl text-black bg-white rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
              placeholder="Search Proposals"
              value={searchFilter}
              onChange={(e) => updateSearchFilter(e.target.value)}
            ></input>
          </div>
        </div>
      </div>
      <ul className="space-y-12 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-3 lg:gap-x-8 mx-10">
        {DUMMY_BENEFICIARY_DATA.filter((beneficiary) => {
          return beneficiary.name
            .toLowerCase()
            .includes(searchFilter.toLowerCase());
        }).map((beneficiary) => (
          <BeneficiaryCard {...beneficiary} />
        ))}
      </ul>
    </div>
  );
}
