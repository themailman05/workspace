import React, { useContext, useState } from 'react';
import { store } from 'app/store';
import NavBar from '../../containers/NavBar/NavBar';
import { setSingleActionModal } from '../../app/actions';

const DUMMY_BENEFICIARY_DATA = new Array(20).fill(undefined).map(() => {
  return {
    name: 'Room to Read',
    missionStatement:
      'Room to Read seeks to transform the lives of millions of children in low-income communities by focusing on literacy and gender equality in education.',
    imageUrl: 'https://i.ytimg.com/vi/JpyeZ6BcslA/maxresdefault.jpg',
    twitterUrl: '#',
    linkedinUrl: '#',
    ethereumAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  };
});

export default function AllGrants() {
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
      <button className="text-white" onClick={() => openModal()}>
        Open Modal Test
      </button>
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
          <li
            key={beneficiary.name}
            onClick={() =>
              (window.location.href =
                'beneficiaries/' + beneficiary.ethereumAddress)
            }
          >
            <div className="space-y-4 border-2 rounded-lg p-2 bg-white">
              <div className="aspect-w-3 aspect-h-2">
                <img
                  className="object-cover shadow-lg rounded-lg"
                  src={beneficiary.imageUrl}
                  alt=""
                />
              </div>

              <div className="space-y-2">
                <div className="text-lg leading-6 font-medium space-y-1">
                  <p className="mb-3 text-3xl font-extrabold text-gray-600">
                    {beneficiary.name}
                  </p>
                  <p className="mt-3 max-w-4xl mx-auto text-xl text-gray-800 sm:mt-5 sm:text-2xl">
                    {beneficiary.missionStatement}
                  </p>
                </div>
                <ul className="flex space-x-5 items-center mt-8">
                  <li>
                    <a
                      href={beneficiary.twitterUrl}
                      className="text-gray-400 hover:text-gray-500 underline"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg
                        className="w-10 h-10"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href={beneficiary.linkedinUrl}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">LinkedIn</span>
                      <svg
                        className="w-10 h-10"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
