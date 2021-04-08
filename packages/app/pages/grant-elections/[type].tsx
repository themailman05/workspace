import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import ElectionSection from 'containers/GrantElections/ElectionSection';
import NavBar from '../../containers/NavBar/NavBar';
import { ContractsContext } from '../../app/contracts';
import {
  GrantElectionAdapter,
  ElectionMetadata,
  ElectionTerm,
} from '@popcorn/utils/Contracts';
import { utils } from 'ethers';
import capitalize from '@popcorn/utils/capitalize';
import { ElectionTermIntToName } from '@popcorn/utils/Contracts/GrantElection/GrantElectionAdapter';
import bluebird from 'bluebird';
import TwoButtonModal, {
  DefaultTwoButtonModalProps,
} from 'components/Modal/TwoButtonModal';
import SingleActionModal, {
  DefaultSingleActionModalProps,
} from 'components/Modal/SingleActionModal';

export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

export interface Vote {
  address: string;
  votes: number;
}
export interface Votes {
  [key: string]: number;
  total: number;
  // address: votes
}

export interface PendingVotes {
  [key: number]: {
    total: number;
    lastAddress: string;
    lastAmount: number;
    addresses: {
      [key: string]: number;
    };
  };
  // grant election: Vote;
}

const defaultPendingVotes = {
  [ElectionTerm.Monthly]: {
    total: 0,
    lastAddress: '',
    lastAmount: 0,
    addresses: {},
  },
  [ElectionTerm.Quarterly]: {
    total: 0,
    lastAddress: '',
    lastAmount: 0,
    addresses: {},
  },
  [ElectionTerm.Yearly]: {
    total: 0,
    lastAddress: '',
    lastAmount: 0,
    addresses: {},
  },
};

const getSelectedGrantTermsFromQuery = (type: string): number[] => {
  if (type == 'all') {
    return [0, 1, 2];
  }
  return type && [ElectionTerm[capitalize(type as string)]];
};

const getOtherGrantElections = (currentGrantElection: number[]): number[] => {
  return [0, 1, 2].filter((x) => !currentGrantElection.includes(x));
};

export default function AllGrants() {
  const router = useRouter();
  const context = useWeb3React<Web3Provider>();
  const { library, account, activate } = context;
  const { contracts } = useContext(ContractsContext);
  const [pendingVotes, setPendingVotes] = useState<PendingVotes>(
    defaultPendingVotes,
  );
  const [grantElections, setGrantElections] = useState<ElectionMetadata[]>([]);
  const [voiceCredits, setVoiceCredits] = useState(0);
  const [activeGrantRound, scrollToGrantRound] = useState<number>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });
  const [selectedGrantTerms, setSelectedGrantTerms] = useState<number[]>([]);

  const DefaultVoteConfirmationModal = {
    ...DefaultTwoButtonModalProps,
    grantTerm: null,
  };
  const [voteConfirmationModal, setVoteConfirmationModal] = useState(
    DefaultVoteConfirmationModal,
  );

  const [singleActionModal, setSingleActionModal] = useState(
    DefaultSingleActionModalProps,
  );

  useEffect(() => {
    if (router?.query?.type) {
      setSelectedGrantTerms(
        getSelectedGrantTermsFromQuery(router.query.type as string),
      );
    }
  }, [router]);

  const getElectionMetadata = async () => {
    const elections = await bluebird.map(selectedGrantTerms, async (term) => {
      return GrantElectionAdapter(contracts?.election).getElectionMetadata(
        term,
      );
    });
    setGrantElections(elections);
  };

  const getVoiceCredits = async (account) => {
    if (!account) return;
    const vCredits = await contracts.staking.getVoiceCredits(account);
    const vCreditsFormatted = +utils
      .formatEther(vCredits)
      .toString()
      .split('.')[0];
    setVoiceCredits(vCreditsFormatted);
  };

  useEffect(() => {
    if (!contracts || !selectedGrantTerms.length) {
      return;
    }
    getElectionMetadata();
    getVoiceCredits(account);
  }, [contracts, account, selectedGrantTerms]);

  useEffect(() => {
    if (!grantRoundFilter.active && !grantRoundFilter.closed) {
      setGrantRoundFilter({ active: true, closed: true });
    }
  }, [grantRoundFilter]);

  function connectWallet() {
    activate(connectors.Injected);
  }

  /**
   * Assigns votes
   * implements binary approach to improve performance and lagging so we're not
   * recalculating the totals every time the slider moves
   * @param grantTerm
   * @param vote
   */
  function assignVotes(grantTerm: number, vote: Vote): void {
    pendingVotes[grantTerm].addresses[vote.address] = vote.votes;
    if (vote.address == pendingVotes[grantTerm].lastAddress) {
      pendingVotes[grantTerm].total -= pendingVotes[grantTerm].lastAmount;
      pendingVotes[grantTerm].total += vote.votes;
      pendingVotes[grantTerm].lastAmount = vote.votes;
    } else {
      pendingVotes[grantTerm].lastAddress = vote.address;
      pendingVotes[grantTerm].lastAmount = vote.votes;
      pendingVotes[grantTerm].total = Object.keys(
        pendingVotes[grantTerm].addresses,
      ).reduce((total, current) => {
        total += pendingVotes[grantTerm].addresses[current];
        return total;
      }, 0);
    }

    // this handles the case when a fast hand with the slider assigns more votes than allowed
    if (pendingVotes[grantTerm].total > voiceCredits) {
      pendingVotes[grantTerm].addresses[vote.address] =
        vote.votes - (pendingVotes[grantTerm].total - voiceCredits);
      pendingVotes[grantTerm].lastAmount =
        pendingVotes[grantTerm].addresses[vote.address];
      pendingVotes[grantTerm].total = voiceCredits;
    }

    setPendingVotes({ ...pendingVotes });
  }

  const submitVotes = async (grantTerm: ElectionTerm) => {
    setVoteConfirmationModal({...voteConfirmationModal, progress: true});
    const txArgs = Object.keys(pendingVotes[grantTerm].addresses).reduce<
      [string[], number[], number]
    >(
      (txArgs, address) => {
        txArgs[0].push(address);
        txArgs[1].push(pendingVotes[grantTerm].addresses[address]);
        return txArgs;
      },
      [[], [], grantTerm],
    );
    try {
      await contracts.election
        .connect(library.getSigner())
        .vote(txArgs[0], txArgs[1], txArgs[2]);
        setVoteConfirmationModal({
          ...DefaultVoteConfirmationModal,
          grantTerm,
        });
    } catch (err) {
      setVoteConfirmationModal({
        ...DefaultVoteConfirmationModal,
        grantTerm,
      });
      setSingleActionModal({
        content: `There was an error processing this transaction: ${err.message}`,
        title: 'Transaction Failed',
        visible: true,
        type: 'error',
        onConfirm: {
          label: 'Go Back',
          onClick: () =>
            setSingleActionModal({ ...DefaultSingleActionModalProps }),
        },
      });

    } 
  };

  return (
    <div className="w-full">
      <NavBar />
      <TwoButtonModal
        visible={voteConfirmationModal.visible}
        title={voteConfirmationModal.title}
        content={voteConfirmationModal.content}
        progress={voteConfirmationModal.progress}
        onDismiss={voteConfirmationModal.onDismiss}
        onConfirm={voteConfirmationModal.onConfirm}
      />
      <SingleActionModal
        visible={singleActionModal.visible}
        title={singleActionModal.title}
        content={singleActionModal.content}
        type={singleActionModal.type}
        onConfirm={singleActionModal.onConfirm}
      />
      <div className="w-10/12 mx-auto mt-8">
        {[...grantElections]
          .filter(
            (election) =>
              (GrantElectionAdapter().isActive(election) &&
                grantRoundFilter.active) ||
              (!GrantElectionAdapter().isActive(election) &&
                grantRoundFilter.closed),
          )
          .sort(
            (election1, election2) =>
              Number(election2.startTime) - Number(election1.startTime),
          )
          .map((election) => (
            <ElectionSection
              id={election?.electionTerm}
              key={election?.electionTerm}
              pendingVotes={pendingVotes}
              election={election}
              voiceCredits={voiceCredits}
              isWalletConnected={library?.connection?.url === 'metamask'}
              grantRoundFilter={grantRoundFilter}
              assignVotes={assignVotes}
              connectWallet={connectWallet}
              submitVotes={(grantTerm) => {
                setVoteConfirmationModal({
                  grantTerm,
                  content:
                    'You are about to submit your vote. You will not be able to vote again for this grant election after you submit your vote. \
                     Confirm to continue.',
                  title: 'Confirm Vote',
                  visible: true,
                  onConfirm: {
                    label: 'Confirm Vote',
                    onClick: () => {
                      submitVotes(grantTerm);
                    },
                  },
                  onDismiss: {
                    label: 'Cancel',
                    onClick: () =>
                      setVoteConfirmationModal({
                        ...DefaultVoteConfirmationModal,
                        grantTerm,
                      }),
                  },
                });
              }}
              scrollToGrantRound={scrollToGrantRound}
              setGrantRoundFilter={setGrantRoundFilter}
              scrollToMe={election.electionTerm === activeGrantRound}
            />
          ))}
      </div>
      {getOtherGrantElections(selectedGrantTerms).length && (
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-lg font-medium text-gray-900">
              Other Grant Elections
            </span>
          </div>
        </div>
      )}
      {getOtherGrantElections(selectedGrantTerms).map((election) => (
        <div
          key={election}
          className="mt-4 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-5"
        >
          <div className="max-w-md mx-auto lg:max-w-5xl">
            <div className="rounded-lg bg-gray-100 px-6 py-8 sm:p-10 lg:flex lg:items-center">
              <div className="flex-1">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white text-gray-800">
                    🏆 {capitalize(ElectionTermIntToName[election])} Grant
                    Election
                  </h3>
                </div>
                <div className="mt-4 text-lg text-gray-600">
                  The {ElectionTermIntToName[election]} grant election is:{' '}
                  <span className="font-semibold text-gray-900">live</span>.
                </div>
              </div>
              <div className="mt-6 rounded-md shadow lg:mt-0 lg:ml-10 lg:flex-shrink-0">
                <Link
                  href={`/grant-elections/${ElectionTermIntToName[election]}`}
                  passHref
                >
                  <a
                    href="#"
                    className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                  >
                    View {ElectionTermIntToName[election]} election
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
