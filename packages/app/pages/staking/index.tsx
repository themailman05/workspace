import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useState, useEffect, useContext } from 'react';
import { connectors } from '../../containers/Web3/connectors';
import { utils } from 'ethers';
import NavBar from '../../containers/NavBar/NavBar';
import Modal from 'components/Modal';
import DropdownSelect from 'components/DropdownSelect';
import { ContractsContext } from 'app/contracts';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ONE_WEEK = 604800;
const lockPeriods = [
  { label: '1 week', value: ONE_WEEK },
  { label: '1 month', value: ONE_WEEK * 4 },
  { label: '3 months', value: ONE_WEEK * 4 * 3 },
  { label: '6 months', value: ONE_WEEK * 4 * 6 },
  { label: '1 year', value: ONE_WEEK * 52 },
  { label: '4 years', value: ONE_WEEK * 52 * 4 },
];

export default function LockPop() {
  const context = useWeb3React<Web3Provider>();
  const { library, account, activate, active } = context;
  const { contracts } = useContext(ContractsContext);
  const [popToLock, setPopToLock] = useState<number>(0);
  const [lockDuration, setLockDuration] = useState<number>(ONE_WEEK);
  const [popBalance, setPopBalance] = useState(0);
  const [voiceCredits, setVoiceCredits] = useState<number>(0);
  const [approved, setApproval] = useState<number>(0);
  const [wait, setWait] = useState<boolean>(false);

  useEffect(() => {
    setVoiceCredits(popToLock * (lockDuration / (ONE_WEEK * 52 * 4)));
  }, [lockDuration, popToLock]);

  useEffect(() => {
    if (!account) {
      return;
    }
    contracts.pop
      .balanceOf(account)
      .then((res) => setPopBalance(Number(utils.formatEther(res))));
    contracts.pop
      .allowance(account, contracts.staking.address)
      .then((res) => setApproval(Number(utils.formatEther(res))));
  }, [account]);

  async function lockPop(): Promise<void> {
    setWait(true);
    const lockedPopInEth = utils.parseEther(popToLock.toString());
    const signer = library.getSigner();

    const connectedStaking = await contracts.staking.connect(signer);
    await connectedStaking
      .stake(lockedPopInEth, lockDuration)
      .then((res) => {
        console.log('successfully staked', res);
        //Show Success Modal
      })
      .catch((err) => {
        console.log(err, 'err');
        //Show Error Modal
      });
  }

  async function approve(): Promise<void> {
    setWait(true);
    const lockedPopInEth = utils.parseEther(popToLock.toString());
    const connected = await contracts.pop.connect(library.getSigner());
    await connected
      .approve(contracts.staking.address, lockedPopInEth)
      .then((res) => console.log('approved', res))
      .catch((err) => console.log('err', err));
    setWait(false);
  }

  return (
    <div className="w-full bg-gray-900 h-screen">
      <NavBar />
      {!account && (
        <Modal>
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                Connect Wallet
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You must connect your wallet in order to lock POP.
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => activate(connectors.Injected)}
              >
                Connect
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div className="bg-gray-900">
        <div className="pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
          <div className="text-center">
            <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              POP Staking
            </p>
            <p className="mt-3 max-w-4xl mx-auto text-xl text-gray-300 sm:mt-5 sm:text-2xl">
              In order to participate in the selection of beneficiaries and
              awarding grants to beneficiaries, you need voice credits. Stake
              your POP to gain voice credits.
            </p>
          </div>
        </div>

        <div className="mt-16 pb-12 lg:mt-20 lg:pb-20">
          <div className="relative z-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative lg:grid lg:grid-cols-7">
                <div className="mt-10 max-w-lg mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-start-3 lg:col-end-6 lg:row-start-1 lg:row-end-4">
                  <div className="relative z-10 rounded-lg shadow-xl">
                    <div className="bg-white rounded-t-lg px-6 pt-12 pb-10">
                      <div className="flex flex-col">
                        <h3
                          className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                          id="tier-growth"
                        >
                          Voice Credits
                        </h3>
                        <p className="px-3 text-center my-4 text-6xl font-black tracking-tight text-gray-900 sm:text-6xl">
                          {voiceCredits}
                        </p>
                        <div className="w-10/12 mx-auto">
                          <div className="w-full">
                            <span className="flex flex-row justify-between">
                              <p className="text-gray-600">Locked Pop</p>
                              <span className="text-gray-600 flex flex-row">
                                <p className="">
                                  {popToLock}/{popBalance}
                                </p>
                              </span>
                            </span>
                            <Slider
                              className="mt-2 w-10/12"
                              value={popToLock}
                              onChange={(val) => setPopToLock(Number(val))}
                              min={0}
                              max={popBalance}
                              step={1}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t-2 border-gray-100 rounded-b-lg pt-10 pb-8 px-6 bg-gray-50 space-y-4 sm:px-10 sm:py-10">
                      <span className="flex flex-row items-center justify-between">
                        <p className="">
                          For how long do you want to lock your POP?
                        </p>
                        <DropdownSelect
                          label={'Time Period'}
                          selectedValue={
                            lockPeriods.find(
                              (period) =>
                                Number(period.value) === Number(lockDuration),
                            ).label
                          }
                          selectOptions={lockPeriods}
                          selectOption={setLockDuration}
                        />
                      </span>
                      <p className="text-sm text-gray-500">
                        Locking tokens for a longer period of time will give you
                        more voting power. (POP * duration / max duration)
                      </p>
                      <div className="rounded-lg shadow-md">
                        {approved !== 0 && approved >= popToLock ? (
                          <button
                            type="button"
                            className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl leading-6 font-medium text-white hover:bg-indigo-700"
                            onClick={lockPop}
                            disabled={wait || popToLock === 0}
                          >
                            Stake POP
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl leading-6 font-medium text-white hover:bg-indigo-700"
                            onClick={approve}
                            disabled={wait || popToLock === 0}
                          >
                            Approve POP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
