import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import activeElections from '../../fixtures/activeElections.json';
import closedElections from '../../fixtures/closedElections.json';
import createGrantRounds from 'utils/createGrantRounds';
import ElectionSection from 'containers/GrantElections/ElectionSection';
import createElectionName from 'utils/createElectionName';
import NavBar from '../../containers/NavBar/NavBar';
import { ContractsContext } from '../../app/contracts';
import { GrantElectionAdapter, ElectionMetadata, ElectionTerm } from "@popcorn/utils/Contracts";
import { utils } from 'ethers';
import capitalize from "@popcorn/utils/capitalize";
import { ElectionTermIntToName } from '@popcorn/utils/Contracts/GrantElection/GrantElectionAdapter';
import bluebird from "bluebird";


export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

export interface IVote {
  address: string;
  votes: number;
}

export interface IElectionVotes {
  votes: IVote[];
}

const getSelectedGrantTermsFromQuery = (type: string): number[] => {
  if (type == 'all') {
    return [0, 1, 2];
  }
  return type && [ElectionTerm[capitalize(type as string)]];
}

const getOtherGrantElections = (currentGrantElection: number[]): number[] => {
  return [0, 1, 2].filter((x) => !currentGrantElection.includes(x));
}

export default function AllGrants() {
  const router = useRouter();
  const context = useWeb3React<Web3Provider>();
  const {
    library,
    account,
    activate,
  } = context;
  const { contracts } = useContext(ContractsContext);
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [votes, setVotes] = useState<any[]>([]);
  const [grantElections, setGrantElections] = useState<
    ElectionMetadata[]
  >([]);
  const [voiceCredits, setVoiceCredits] = useState(0);
  const [activeGrantRound, scrollToGrantRound] = useState<number>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });
  const [selectedGrantTerms, setSelectedGrantTerms] = useState<number[]>([]);


  useEffect(() => {
    if (router?.query?.type) {
      setSelectedGrantTerms(getSelectedGrantTermsFromQuery(router.query.type as string));
    }
  }, [router])

  const getElectionMetadata = async () => {
    const elections = await bluebird.map(selectedGrantTerms, async (term) => {
      return GrantElectionAdapter(contracts?.election)
        .getElectionMetadata(term)
    });
    setGrantElections(elections);
  }

  const getVoiceCredits = async (account) => {
    if (!account) return;
    const vCredits = await contracts.staking.getVoiceCredits(account);
    const vCreditsFormatted = +utils.formatEther(vCredits).toString().split('.')[0];
    setMaxVotes(vCreditsFormatted);
    setVoiceCredits(vCreditsFormatted);
  }

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

  function assignVotes(grantTerm: number, vote: IVote): void {
    const votesCopy = [...votes];
    const updatedElection = [
      ...votesCopy[grantTerm]?.filter(
        (awardee) => awardee.address !== vote.address,
      ),
      vote,
    ];
    votesCopy.splice(grantTerm, 1, updatedElection);
    setVotes(votesCopy);
  }

  function submitVotes() {
    console.log('SUBMIT VOTES');
    console.log(
      votes.map((election) =>
        election.map((awardee) => [awardee.address, awardee.votes]),
      ),
    );
    console.log('__________________');
  }

  return (
    <div className="w-full">
      <NavBar />
      <div className="w-10/12 mx-auto mt-8">
        {[...grantElections]
          .filter(
            (election) =>
              (GrantElectionAdapter().isActive(election) && grantRoundFilter.active) ||
              (!GrantElectionAdapter().isActive(election) && grantRoundFilter.closed),
          )
          .sort(
            (election1, election2) =>
              Number(election2.startTime) - Number(election1.startTime),
          )
          .map((election) => (
            <ElectionSection
              key={election?.electionTerm}
              id={election?.electionTerm}
              title={createElectionName(election)}
              description={''}
              grantTerm={election?.electionTerm}
              isActiveElection={GrantElectionAdapter().isActive(election)}
              beneficiaries={election?.registeredBeneficiaries}
              maxVotes={maxVotes}
              voiceCredits={voiceCredits}
              votes={GrantElectionAdapter().isActive(election) ? votes[election.electionTerm] : null}
              grantRounds={createGrantRounds(activeElections, closedElections)}
              isWalletConnected={library?.connection?.url === 'metamask'}
              grantRoundFilter={grantRoundFilter}
              assignVotes={assignVotes}
              connectWallet={connectWallet}
              submitVotes={submitVotes}
              scrollToGrantRound={scrollToGrantRound}
              setGrantRoundFilter={setGrantRoundFilter}
              scrollToMe={election.electionTerm === activeGrantRound}
              quadratic={false}
            />
          ))}
      </div>
      {getOtherGrantElections(selectedGrantTerms).length && (
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-lg font-medium text-gray-900">
            Other Grant Elections
          </span>
        </div>
      </div>)}
      {getOtherGrantElections(selectedGrantTerms).map((election) => (
        <div key={election} className="mt-4 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-5">
          <div className="max-w-md mx-auto lg:max-w-5xl">
            <div className="rounded-lg bg-gray-100 px-6 py-8 sm:p-10 lg:flex lg:items-center">
              <div className="flex-1">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white text-gray-800">
                  🏆 {capitalize(ElectionTermIntToName[election])} Grant Election
                  </h3>
                </div>
                <div className="mt-4 text-lg text-gray-600">The {ElectionTermIntToName[election]} grant election is: <span className="font-semibold text-gray-900">live</span>.</div>
              </div>
              <div className="mt-6 rounded-md shadow lg:mt-0 lg:ml-10 lg:flex-shrink-0">
                <Link href={`/grant-elections/${ElectionTermIntToName[election]}`} passHref>
                <a href="#" className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
                  View {ElectionTermIntToName[election]} election
              </a>
              </Link>
              </div>
            </div>
          </div>
        </div>
      )

      )}
    </div>
  );
}
