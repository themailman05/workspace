import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import activeElections from '../../fixtures/activeElections.json';
import closedElections from '../../fixtures/closedElections.json';
import createGrantRounds from 'utils/createGrantRounds';
import ElectionSection from 'containers/GrantElections/ElectionSection';
import createElectionName from 'utils/createElectionName';
import NavBar from './../../containers/NavBar/NavBar';
import { ContractsContext } from '../../app/contracts';
import {
  GrantElectionAdapter,
  ElectionMetadata,
} from '@popcorn/utils/Contracts';
import { utils } from 'ethers';
import Modal from '../../containers/modal';

const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };

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

export default function GrantOverview() {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const { contracts } = useContext(ContractsContext);
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [votes, setVotes] = useState<any[]>([]);
  const [grantElections, setGrantElections] = useState<ElectionMetadata[]>([]);
  const [voiceCredits, setVoiceCredits] = useState(0);
  const [activeGrantRound, scrollToGrantRound] = useState<number>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });
  const [registered, setRegistered] = useState<boolean>(false);
  const [electionsSignedUpFor, setElectionsSignedUpFor] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [beneficiaryExists, setBeneficiaryExists] = useState<boolean>(false);

  const getElectionMetadata = async () => {
    const monthly = await GrantElectionAdapter(
      contracts?.election,
    ).getElectionMetadata(0);
    const quarterly = await GrantElectionAdapter(
      contracts?.election,
    ).getElectionMetadata(1);
    const yearly = await GrantElectionAdapter(
      contracts?.election,
    ).getElectionMetadata(2);
    setGrantElections([monthly, quarterly, yearly]);
  };

  async function IsUserAlreadyRegistered() {
    const connected = contracts.election.connect(library.getSigner());
    const elections = [
      await connected._isEligibleBeneficiary(account, GRANT_TERM.MONTH),
      await connected._isEligibleBeneficiary(account, GRANT_TERM.QUARTER),
      await connected._isEligibleBeneficiary(account, GRANT_TERM.YEAR),
    ];
    setElectionsSignedUpFor(elections);
  }

  useEffect(() => {
    // Call to see if user has already registered for election
    if (contracts?.election && account) {
      IsUserAlreadyRegistered();
    }
  }, [contracts, account]);

  useEffect(() => {
    // call to see if we are an eligible beneficiary
    if (contracts?.beneficiary && account) {
      let connected = contracts.beneficiary.connect(library.getSigner());
      connected
        .beneficiaryExists(account)
        .then((response) => setBeneficiaryExists(response))
        .catch((err) => console.log(err, 'beneficiary doesnt exist'));
    }
  }, [contracts, account]);

  function registerForElection(grant_term) {
    // Register for selected election
    let connected = contracts.election.connect(library.getSigner());
    connected
      .registerForElection(account, grant_term)
      .then((res) => {
        setRegistered(true);
        let newElectionSignedUpForArray = electionsSignedUpFor;
        newElectionSignedUpForArray[grant_term] = true;
        setElectionsSignedUpFor(newElectionSignedUpForArray);
      })
      .catch((err) => {
        console.log(err);
        setRegistered(false);
      });
  }

  const getVoiceCredits = async (account) => {
    if (!account) return;
    const vCredits = await contracts.staking.getVoiceCredits(account);
    const vCreditsFormatted = +utils
      .formatEther(vCredits)
      .toString()
      .split('.')[0];
    setMaxVotes(vCreditsFormatted);
    setVoiceCredits(vCreditsFormatted);
  };

  useEffect(() => {
    if (contracts?.pop && account) {
      contracts.pop
        .balanceOf(account)
        .then((res) => console.log('POP Balance: ', res));
    }
  }, [contracts, account]);

  useEffect(() => {
    if (!contracts) {
      return;
    }
    getElectionMetadata();
    getVoiceCredits(account);
  }, [contracts, account]);

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

  function registeredModal() {
    return (
      <Modal visible={registered === true ? 'visible' : 'invisible'}>
        <p>You have successfully registered for this grant election</p>
        <div className="button-modal-holder">
          <button onClick={() => setRegistered(false)} className="button-1">
            Done
          </button>
        </div>
      </Modal>
    );
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
      {registeredModal()}
      <NavBar />
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
              key={election?.electionTerm}
              id={election?.electionTerm}
              title={createElectionName(election)}
              description={''}
              grantTerm={election?.electionTerm}
              isActiveElection={GrantElectionAdapter().isActive(election)}
              beneficiaries={election?.registeredBeneficiaries}
              maxVotes={maxVotes}
              voiceCredits={voiceCredits}
              votes={
                GrantElectionAdapter().isActive(election)
                  ? votes[election.electionTerm]
                  : null
              }
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
              userIsEligibleBeneficiary={beneficiaryExists}
              registerForElection={registerForElection}
              alreadyRegistered={electionsSignedUpFor[election.electionTerm]}
            />
          ))}
      </div>
    </div>
  );
}
