import React, { useContext, useState } from 'react';
import { store } from 'app/store';
import { setDualActionModal,setSingleActionModal } from '../../app/actions';
import NavBar from '../../containers/NavBar/NavBar';

import { DummyBeneficiary } from './interfaces'

const DUMMY_BENEFICIARY_DATA: DummyBeneficiary = {
  name: 'Room to Read',
  missionStatement:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris hendrerit arcu mauris, id tincidunt elit tristique rutrum. Integer malesuada eros a tortor iaculis finibus. Duis sollicitudin turpis enim, non rhoncus lorem pulvinar ut. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed nec ex vitae orci ultricies mollis a quis erat. Donec varius ornare elementum. Duis porta urna sed finibus fermentum. Donec consequat tincidunt iaculis. Nullam placerat eleifend blandit. Mauris gravida, nibh vitae blandit eleifend, augue turpis suscipit ipsum, interdum ullamcorper enim dolor nec massa. In lectus ex, vestibulum interdum lectus a, consectetur molestie velit. Etiam pretium justo et condimentum consectetur. Proin sed dui eget purus ullamcorper aliquet euismod in enim. Integer in ex ac elit lobortis rhoncus. Ut suscipit rhoncus purus, ac dictum nisi pharetra in. In hac habitasse platea dictumst. Pellentesque condimentum semper orci, vel euismod justo porta a. Vestibulum id facilisis magna. Ut eros neque, consequat at urna a, eleifend mattis tellus. Fusce neque augue, imperdiet et lacus sed, fringilla pellentesque metus. Fusce auctor rhoncus diam quis pretium. Sed quis massa ultricies, luctus risus at, maximus tellus. Integer ac lacus euismod, condimentum erat ac, accumsan lorem. Pellentesque eu lobortis dolor, sed pellentesque nulla. Maecenas malesuada augue dui, eu facilisis sem egestas eu. Aliquam ac ligula eget erat laoreet rutrum at et metus. Suspendisse lacinia, nisi eu tempor congue, nibh erat ullamcorper turpis, non varius ligula justo non ex. Maecenas nisl nisl, dictum non tincidunt id, feugiat a nibh. Phasellus tincidunt ac turpis non pharetra. Sed non risus non sem consequat faucibus. In sodales non sem varius tempor. Maecenas nec volutpat ligula. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vivamus justo neque, pellentesque imperdiet ex tincidunt, consequat gravida nulla. \nMauris condimentum, est vitae pharetra tincidunt, ligula erat dapibus risus, id condimentum est ex et nulla. Nunc facilisis purus laoreet tincidunt mattis. Aliquam sollicitudin non dui non imperdiet. Vestibulum convallis massa vel ullamcorper hendrerit. Morbi a ultrices metus. Pellentesque metus nisi, ultricies a mauris vitae, finibus interdum massa. Praesent ac sem elementum, rutrum turpis in, euismod magna. Cras volutpat mauris ut mauris sollicitudin, sed bibendum enim auctor. Integer laoreet, purus ac aliquet dignissim, felis erat consectetur sem, at interdum odio arcu in urna. Nulla id erat et justo bibendum fringilla ac non felis. Aenean auctor interdum lectus.\nLorem ipsum dolor sit amet, consectetur adipiscing elit. In imperdiet velit et urna dictum vehicula. Vestibulum vitae urna sit amet lorem gravida ullamcorper. Aliquam id neque tincidunt, aliquam leo vitae, iaculis risus. Quisque neque diam, hendrerit id condimentum ut, laoreet vel neque. Proin pellentesque tortor vel ex cursus, non feugiat quam consequat. Cras eget finibus nisl. Fusce efficitur libero et tellus fringilla, sed porta felis mollis.',
  profileImageURL:
    'https://pbs.twimg.com/profile_images/769217849470619648/hHeKiLwY_400x400.jpg',
  
  photoURLs: new Array(4)
    .fill(undefined)
    .map(
      () =>
        'https://www.roomtoread.org/media/y15dlrxn/gep_anna_tanzania-logo.png?center=0.50013280362582158,0.5&mode=crop&width=1200&height=630&rnd=132630538660400000',
    ),
  impactReports: new Array(4)
    .fill(undefined)
    .map(
      () =>
        'https://www.roomtoread.org/media/gm1j4iaz/summary_room-to-read-global-strategic-plan_2020-2024_external-4.pdf',
    ),
  twitterUrl: '#',
  linkedinUrl: '#',
  ethereumAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  headerImageURL:
    'https://pbs.twimg.com/profile_banners/64823914/1591143684/600x200',
};

export default function BeneficiaryPage() {
  const { dispatch } = useContext(store);
  const [searchFilter, updateSearchFilter] = useState('');

  const triggerTakedownProposal = () => {
    dispatch(
      setDualActionModal({
        visible: true,
        progress: true,
      }),
    );
    // TODO handle takedown process
  };

  return (
    <div className="flex flex-col h-full w-full  pb-16">
      <NavBar />
      <div className="pt-12 px-4 bg-gray-900 sm:px-6 lg:px-8 lg:pt-20">
        <div className="text-center mx-28">
          <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
          <div className="relative">
            <p className="mb-10 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              {DUMMY_BENEFICIARY_DATA.name}
            </p>

            <img
              className="object-cover shadow-lg rounded-lg  w-full"
              src={DUMMY_BENEFICIARY_DATA.headerImageURL}
              alt=""
            />
              <img
                className="absolute -bottom-48 left-10 shadow-lg rounded-full h-131.5 border-black "
                src={DUMMY_BENEFICIARY_DATA.profileImageURL}
                alt=""
              />
          </div>
        </div>
      </div>
      <div className="h-48"></div>
      <div className="grid grid-cols-7 gap-4 mx-28">
        <div className="col-span-2">
          <p className="mt-2 mx-5 text-3xl font-extrabold text-black sm:text-4xl lg:text-5xl">
            Photos
          </p>
          {DUMMY_BENEFICIARY_DATA.photoURLs.map((photoURL) => {
            return (
              <div className="m-4">
                <img src={photoURL} alt="" />
              </div>
            );
          })}
        </div>
        <div className="col-span-5">
          <p className="mt-2 text-3xl font-extrabold text-black sm:text-4xl lg:text-5xl">
            Mission Statement
          </p>
          <p className="mt-10 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
            {DUMMY_BENEFICIARY_DATA.missionStatement}
          </p>
        </div>
      </div>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="text-left mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Etherum Address: {DUMMY_BENEFICIARY_DATA.ethereumAddress}
        </p>
      </a>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Proof of ownership
        </p>
      </a>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Current grants and grant history
        </p>
      </a>
      <p className="mx-28 mt-5 text-3xl font-extrabold text-black sm:text-3xl lg:text-4xl">
        Impact Reports/Audits
      </p>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Impact report 1
        </p>
      </a>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Impact report 2
        </p>
      </a>
      <a
        href={'#'}
        className=" mx-28 text-gray-400 hover:text-gray-500 underline"
      >
        <p className="mt-3 max-w-4xl text-xl text-black sm:mt-5 sm:text-2xl">
          Impact report 3
        </p>
      </a>
      <ul className="flex space-x-5 items-center mt-8 mx-28 ">
        <li>
          <a
            href={DUMMY_BENEFICIARY_DATA.twitterUrl}
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
            href={DUMMY_BENEFICIARY_DATA.linkedinUrl}
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
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2 items-center">
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                dispatch(setDualActionModal({
                  content:
                    'You are about to submit your vote. You will not be able to vote again for this grant election after you submit your vote. \
                     Confirm to continue.',
                  title: 'Trigger Takedown Proposal',
                  onConfirm: {
                    label: 'Confirm Takedown Proposal',
                    onClick: () => {
                      triggerTakedownProposal();
                    },
                  },
                  onDismiss: {
                    label: 'Cancel Takedown Proposal',
                    onClick: () =>
                    setDualActionModal(false),
                  },
                }));
              }}
            >
              Trigger Takedown Proposal
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(
                  setSingleActionModal({
                    title: 'What is a Takedown Proposal?',
                    content: "Triggering a Takedown Proposal begins the process to remove a beneficiary from the registry.\nThis need may be required if the beneficiary's actions violate the principles and values stated in the Popcorn Foundation charter. In the event that an eligible beneficiary violates the principles and values in the Popcorn Foundation charter, or if allocation of funds is not consistent with the charter’s criteria, a Beneficiary Takedown Proposal may be raised, which upon successful execution will remove a beneficiary address from the registry.",
                    visible: true,
                    onConfirm: {
                      label: 'OK',
                      onClick: () => {
                        dispatch(setSingleActionModal(false));
                      },
                    },
                  }),
                );
              }}
              className="h-5 w-5 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <p className="h-5 w-5">i</p>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
