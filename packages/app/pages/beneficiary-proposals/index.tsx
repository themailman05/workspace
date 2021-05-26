import React, { Fragment, useContext, useState } from 'react';
import { store } from '../../context/store';
import NavBar from '../../components/NavBar/NavBar';
import { setSingleActionModal } from '../../context/actions';
import BeneficiaryCard from 'components/Beneficiary-Proposals/BeneficiaryCard';
import StageExplanations from 'components/Beneficiary-Proposals/StageExplanations';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/solid';

import { Stage } from '../../interfaces/beneficiaries';

import { beneficiaryProposalFixtures } from '../../fixtures/beneficiaryProposals';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AllBeneficiaryProposals() {
  const { dispatch } = useContext(store);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<Stage>('All');

  return (
    <div className="w-full bg-gray-900 pb-16">
      <NavBar />
      <div className="pt-12 px-4 bg-indigo-200 sm:px-6 lg:px-8 lg:pt-20 py-20">
        <div className="text-center">
          <p className="mt-2 text-3xl text-indigo-900 sm:text-4xl lg:text-5xl">
            Beneficiary Proposals
          </p>
          <p className="mt-3 max-w-4xl mx-auto text-xl text-indigo-900 sm:mt-5 sm:text-2xl">
            You choose which social initiatives are included in grant elections.
            Browse and vote on beneficiary nominations.
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
              placeholder="Search Proposals"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            ></input>
          </div>
        </div>
        <span className="mx-4 flex flex-row justify-end items-center">
          <p className="text-lg font-medium text-white">Stage Filter</p>
          <InformationCircleIcon
            onClick={() => {
              dispatch(
                setSingleActionModal({
                  title: 'Beneficiary Nomination Proposal Timeline',
                  content: <StageExplanations />,
                  visible: true,
                  onConfirm: {
                    label: 'Close',
                    onClick: () => {
                      dispatch(setSingleActionModal(false));
                    },
                  },
                }),
              );
            }}
            className="h-5 w-5 text-white mx-2"
          />
          <Menu as="div" className="relative inline-block text-left mx-2">
            {({ open }) => (
              <>
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    {stageFilter}
                    <ChevronDownIcon
                      className="-mr-1 ml-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  show={open}
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    static
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div>
                      {['All', 'Open', 'Challenge', 'Completed'].map(
                        (stage: Stage) => {
                          return (
                            <Menu.Item>
                              {({ active }) => {
                                return (
                                  <a
                                    href="#"
                                    onClick={() => setStageFilter(stage)}
                                    className={classNames(
                                      active
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700',
                                      'block px-4 py-2 text-sm',
                                    )}
                                  >
                                    {stage}
                                  </a>
                                );
                              }}
                            </Menu.Item>
                          );
                        },
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </span>
      </div>
      <ul className="sm:grid sm:grid-cols-2 gap-x-2 gap-y-12 lg:grid-cols-3 mx-36">
        {beneficiaryProposalFixtures
          .filter((beneficiaryProposal) => {
            return (
              beneficiaryProposal.name
                .toLowerCase()
                .includes(searchFilter.toLowerCase()) &&
              (beneficiaryProposal.currentStage === stageFilter ||
                stageFilter === 'All')
            );
          })
          .map((beneficiaryProposal) => (
            <BeneficiaryCard
              key={beneficiaryProposal.stageDeadline.toString()}
              {...beneficiaryProposal}
            />
          ))}
      </ul>
    </div>
  );
}
