import Sidebar from '../containers/Grants/Sidebar/Sidebar';
import { useWeb3React } from '@web3-react/core';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useState, useEffect } from 'react';
import { Contract } from '@ethersproject/contracts';
import { connectors } from '../containers/Web3/connectors';
import LockPopSlider from '../containers/lockPopSlider';
import Staking from '../../contracts/artifacts/contracts/Staking.sol/Staking.json';
import MockPop from '../../contracts/artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';
import { ethers } from 'ethers';
const { parseEther } = require("ethers/lib/utils");
// const { ethers }
// import ethers from 'ethers';

export default function LockPop() {
  let maxRemainingVotes = 0;

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
    const [maxVotes, setMaxVotes] = useState<number>(0);
    const [remainingVotes, setRemainingVotes] = useState<number>(0);
    const [activeGrants, setActiveGrants] = useState([]);
    const [grantRegistry, setGrantRegistry] = useState<Contract>();
    const [beneficiaryRegistry, setBeneficiaryRegistry] = useState<Contract>();
    const [activeGrantRound, scrollToGrantRound] = useState<string>();
    const [staking, setStaking] = useState<Contract>();
    const [mockERC, setMockERC] = useState<Contract>();
    const [votes, setVotes] = useState<number>(0);
    const [duration, setDuration] = useState<string>();


    function submitVotes() {}

    async function lockPop() {
      const signer = library.getSigner();

      const connected = await mockERC.connect(signer)
      console.log(connected);
      const minted = await connected.mint('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 100000, { gasPrice: '1' })
      console.log(minted);
      const balance = await mockERC.balanceOf('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'); //this doesnt work
      console.log(balance);

      const connectedStaking = await staking.connect(signer);
      await connectedStaking.stake(2, 606666).then(rez => console.log(rez))
    }

    function connectWallet() {
      activate(connectors.Injected);
    }

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
      if (library?.connection?.url === 'metamask') {
        //TODO get pop -> to tell the user to either lock them or buy some
        //TODO get locked pop -> to vote or tell the user to lock pop
        //TODO swap the contract provider to signer so the user can vote
        //grantRegistry.connect(library.getSigner());
      }
    }
  }, [active]);

    useEffect(() => {
      if (!library) {
        return
      }
      // if (library?.connection?.url === 'metamask') {
      setStaking(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
          Staking.abi,
          library,
        ),
      );

      setMockERC(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
          MockPop.abi,
          library,
        ),
      );
  
    // }

    }, [library, active])

    function assignVotes(id, votes) {
      console.log(id, votes, 'idv')
      setVotes(votes);
    }

  console.log(library, active, account, mockERC)
  return (
        <div className="w-screen">
            <header className="w-full h-10 bg-white"></header>
            <div className="lockpop-page-container">
              <div className="w-2/12 flex flex-col items-center">
                <Sidebar
                  remainingVotes={remainingVotes}
                  maxVotes={maxVotes}
                  grantRounds={[
                    {
                      name: 'Quaterly',
                      address: '0',
                      active: true,
                      year: 2021,
                    },
                    {
                      name: 'Monthly',
                      address: '1',
                      active: false,
                      year: 2021,
                    },
                    {
                      name: 'Yearly',
                      address: '2',
                      active: false,
                      year: 2020,
                    },
                  ]}
                  isWalletConnected={library?.connection?.url === 'metamask'}
                  connectWallet={connectWallet}
                  submitVotes={submitVotes}
                  scrollToGrantRound={scrollToGrantRound}
                  minimal
                />
            </div>
          <div className="lockpop-content-div">
              <h1 className="lock-pop-title">Lock your POP</h1>
              <p className="lockpop-explanation">In order to participate in the selection of beneficiaries and awarding grants to beneficiaries, you must first lock your tokens.
              </p>
              <div className="slider-div">
                <LockPopSlider id="lock-pop-slider" assignVotes={assignVotes} maxVotes={100} totalVotes={votes} votesAssignedByUser={votes} />    
              </div>
              <p>Click below to stake {votes} Pop</p>

              <p className="lockpop-time">how long do you want to lock your POP for? </p>
          
              <p className="lockpop-small">Locking tokens for a longer period of time will give you more voting power.</p>
              <select className="select-time" value={duration} onChange={(v) => setDuration(v.target.value)}>
                {['1 week', '1 month', '3 months', '6 months', '1 year', '4 years'].map(duration => <option value={duration}>{duration}</option>)}
              </select>
              <button className="stake-button" onClick={lockPop}>STAKE</button>          
            </div>
            </div>
         </div>
  )
}