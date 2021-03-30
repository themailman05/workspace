import Sidebar from '../containers/Grants/Sidebar/Sidebar';
import Modal from '../containers/modal';
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
const { BigNumber } = require('@ethersproject/bignumber');


export default function LockPop() {

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
    const [duration, setDuration] = useState<string>('1 week');
    const [pop, setPop] = useState<number>(0);
    const [confirmModal, setConfirmModal] = useState<string>('invisible');
    const [connectModal, setConnectModal] = useState<string>('invisible');
    const [completeModal, setCompleteModal] = useState<string>('invisible');
    const [errorModal, setErrorModal] = useState<string>('invisible');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const stakingAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
    const mockERCAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
    const timeToSeconds = { '1 week': 604800, '1 month': 2635200, '3 months': 7905600, '6 months': 15811200, '1 year': 31622400, '4 years': 126489600 };

    function submitVotes() {}

    async function lockPop(amountToLock, amountOfTime = 606666) {
      const signer = library.getSigner();

      const connected = await mockERC.connect(signer)
      console.log(connected);
      // let parsedAmount = amou;ntToLock
      await connected.approve(stakingAddress, 1).then(res => console.log('approved', res))
      .catch(err => console.log('err', err));

      const connectedStaking = await staking.connect(signer);
      await connectedStaking.stake(1, amountOfTime)
      .then(rez => {
        console.log('successfully staked',rez);
        setConfirmModal('invisible');
        setCompleteModal('visible');
      })
      .catch(err => {
        console.log(err, 'err');
        setErrorModal('visible');
        setErrorMsg(err);
      });

      
    }

    function connectWallet() {
      activate(connectors.Injected);
      setConnectModal('invisible')
    }

    useEffect(() => {
      if (!account) {
        setConnectModal('visible')
      }
    }, [])

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

  async function getBalance() {
    const PopBalance = await mockERC.balanceOf(account);
    const number = BigNumber.from(PopBalance).toNumber();
    console.log('popBalance is ', number);
    if (number) setPop(number);
  }

  useEffect(() => {
    if (account && mockERC && confirmModal === 'invisible') {
      getBalance();
    }
  }, [account, mockERC, confirmModal, completeModal])

    useEffect(() => {
      if (!library) {
        return
      }
      // if (library?.connection?.url === 'metamask') {
      setStaking(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          stakingAddress,
          Staking.abi,
          library,
        ),
      );

      setMockERC(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          mockERCAddress,
          MockPop.abi,
          library,
        ),
      );
  
    }, [library, active])

    function assignVotes(id, votes) {
      console.log(id, votes, 'idv')
      setVotes(votes);
    }

    function CompleteModal() {
      return (
        <Modal visible={completeModal}>
            <p>You have successfully locked {votes} POP for {duration}</p>
            <div className="button-modal-holder">
              <button onClick={() => setCompleteModal('invisible')} className="button-1">Lock more POP</button>
              <button className='button-1' onClick={() => setCompleteModal('invisible')}>Vote in Grant</button>
            </div>
          </Modal>
      )
    }

    function ErrorModal() {
      return (
        <Modal visible={errorModal}>
            <p>There was an error</p>
            <p>{errorMsg}</p>
            <div className="button-modal-holder">
              <button onClick={() => setErrorMsg('invisible')} className="button-1">Try again</button>
            </div>
          </Modal>
      )
    }

  console.log(library, active, account, mockERC)
  return (
        <div className="w-screen">
          <Modal visible={confirmModal}>
            <p>Are you sure you want to lock {votes} POP for {duration} ?</p>
            <div className="button-modal-holder">
              <button onClick={() => lockPop(votes)} className="button-1">Confirm</button>
              <button className='button-1' onClick={() => setConfirmModal('invisible')}>Cancel</button>
            </div>
          </Modal>
          {CompleteModal()}
          {ErrorModal()}
          <Modal visible={connectModal}>
            <p>You must connect your wallet to be able to lock any POP</p>
            <button onClick={connectWallet} className='button-1'>Connect Wallet</button>
          </Modal>

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
            <div className="lockpop-form-div">
              <h1 className="lock-pop-title">Lock your POP</h1>
              <p className="lockpop-explanation">In order to participate in the selection of beneficiaries and awarding grants to beneficiaries, you must first lock your tokens.
              </p>

              <div className="pop-available-div">
                <p>You have {pop} POP tokens available to lock</p>
                <button className="button-1">Purchase more POP</button>
              </div>

              <div className="slider-div">
                <LockPopSlider id="lock-pop-slider" assignVotes={assignVotes} maxVotes={pop} totalVotes={votes} votesAssignedByUser={votes} />    
              </div>
              {/* <p>Click below to stake {votes} Pop</p> */}

              <p className="lockpop-time">how long do you want to lock your POP for? </p>
          
              <p className="lockpop-small">Locking tokens for a longer period of time will give you more voting power.</p>
              
              <select className="select-time" value={duration} onChange={(v) => setDuration(v.target.value)}>
                {['1 week', '1 month', '3 months', '6 months', '1 year', '4 years'].map(duration => <option value={duration}>{duration}</option>)}
              </select>
              {/* <p>Voting power = POP locked * duration / maximum duration</p> */}
              <div className='voting-power-div'>
                <p>Voting power: </p>
                <p className="bold ">{votes * (timeToSeconds[duration] / timeToSeconds['4 years']) }</p>
              </div>
              <button disabled={!votes || !duration} className="button-1 lock-pop-button" onClick={() => setConfirmModal('visible')}>Lock POP</button>          
            </div>
            </div>
            </div>
         </div>
  )
}