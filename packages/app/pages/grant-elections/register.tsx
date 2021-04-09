import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ContractsContext } from 'app/contracts';
import Navbar from 'containers/NavBar/NavBar';
import { connectors } from 'containers/Web3/connectors';
import { useState } from 'react';
import { useContext } from 'react';

export default function Register(): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const { library, account, activate } = context;
  const { contracts } = useContext(ContractsContext);
  const [wait, setWait] = useState<boolean>(false);
  const [registerStatus, setRegisterStatus] = useState<
    'success' | 'error' | 'none'
  >('none');

  async function registerForElection(grantTerm: number): Promise<void> {
    setWait(true);
    const connected = await contracts.election.connect(library.getSigner());
    await connected
      .registerForElection(account, grantTerm)
      .then((res) => setRegisterStatus('success'))
      .catch((err) => setRegisterStatus('error'));
    setWait(false);
  }

  return (
    <div className="w-full h-screen">
      <Navbar />
      <div className="bg-gray-900 h-full">
        <div className="pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
          <div className="text-center">
            <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Register for an Election
            </p>
            <p className="mt-3 max-w-4xl mx-auto text-xl text-gray-300 sm:mt-5 sm:text-2xl">
              Choose for which grant election you want to register.
            </p>
          </div>
        </div>
        <div className="mt-16 pb-12 lg:mt-20 lg:pb-20">
          <div className="relative z-0">
            <div className="absolute inset-0 h-5/6 bg-gray-900 lg:h-2/3"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative lg:grid lg:grid-cols-7">
                <div className="mx-auto max-w-md lg:mx-0 lg:max-w-none lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3">
                  <div className="h-full flex flex-col rounded-lg shadow-lg overflow-hidden lg:rounded-none lg:rounded-l-lg">
                    <div className="flex-1 flex flex-col">
                      <div className="bg-white px-6 py-10">
                        <div>
                          <h3
                            className="text-center text-2xl font-medium text-gray-900"
                            id="tier-hobby"
                          >
                            Monthly Grant Election
                          </h3>
                          <div className="mt-4 flex items-center justify-center">
                            <span className="px-3 flex items-start text-6xl tracking-tight text-gray-900">
                              <span className="mt-2 mr-2 text-4xl font-medium">
                                $
                              </span>
                              <span className="font-extrabold">244,503</span>
                            </span>
                            <span className="text-xl font-medium text-gray-500">
                              (est.)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between border-t-2 border-gray-100 p-6 bg-gray-50 sm:p-10 lg:p-6 xl:p-10">
                        <div className="flex  flex-shrink-0 items-start">
                          <svg
                            className="flex-shrink-0 h-6 w-6 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              fill="currentcolor"
                              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                            />
                          </svg>
                          <p className="ml-3 text-base font-medium text-gray-500">
                            Election Closed
                          </p>
                        </div>
                        <div className="mt-4">
                          <div className="rounded-lg shadow-md">
                            <button
                              className="block w-full text-center rounded-lg border border-transparent bg-white px-6 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 disabled:opacity-50"
                              aria-describedby="tier-scale"
                              disabled
                            >
                              Register for Election
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 max-w-lg mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-start-3 lg:col-end-6 lg:row-start-1 lg:row-end-4">
                  <div className="relative z-10 rounded-lg shadow-xl">
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg border-2 border-indigo-600"
                      aria-hidden="true"
                    ></div>
                    <div className="bg-white rounded-t-lg px-6 pt-12 pb-10">
                      <div>
                        <h3
                          className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                          id="tier-growth"
                        >
                          Yearly Grant Election
                        </h3>
                        <div className="mt-4 flex items-center justify-center">
                          <span className="px-3 flex items-start text-6xl tracking-tight text-gray-900 sm:text-6xl">
                            <span className="mt-2 mr-2 text-4xl font-medium">
                              $
                            </span>
                            <span className="font-extrabold">2.9M</span>
                          </span>
                          <span className="text-2xl font-medium text-gray-500">
                            (est.)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t-2 border-gray-100 rounded-b-lg pt-10 pb-8 px-6 bg-gray-50 sm:px-10 sm:py-10">
                      <div className="flex  flex-shrink-0 items-start">
                        <svg
                          className="flex-shrink-0 h-6 w-6 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <p className="ml-3 text-base font-medium text-gray-500">
                          Election Open
                        </p>
                      </div>
                      <div className="mt-6">
                        <div className="rounded-lg shadow-md">
                          {account ? (
                            <button
                              className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl leading-6 font-medium text-white hover:bg-indigo-700 disabled:opacity:50"
                              aria-describedby="tier-growth"
                              disabled={wait}
                              onClick={() => registerForElection(2)}
                            >
                              Register for Election
                            </button>
                          ) : (
                            <button
                              className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl leading-6 font-medium text-white hover:bg-indigo-700 disabled:opacity:50"
                              aria-describedby="tier-growth"
                              onClick={() => activate(connectors.Injected)}
                            >
                              Connect Wallet
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 mx-auto max-w-md lg:m-0 lg:max-w-none lg:col-start-6 lg:col-end-8 lg:row-start-2 lg:row-end-3">
                  <div className="h-full flex flex-col rounded-lg shadow-lg overflow-hidden lg:rounded-none lg:rounded-r-lg">
                    <div className="flex-1 flex flex-col">
                      <div className="bg-white px-6 py-10">
                        <div>
                          <h3
                            className="text-center text-2xl font-medium text-gray-900"
                            id="tier-scale"
                          >
                            Quarterly Grant Election
                          </h3>
                          <div className="mt-4 flex items-center justify-center">
                            <span className="px-3 flex items-start text-6xl tracking-tight text-gray-900">
                              <span className="mt-2 mr-2 text-4xl font-medium">
                                $
                              </span>
                              <span className="font-extrabold">733,509</span>
                            </span>
                            <span className="text-xl font-medium text-gray-500">
                              (est.)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between border-t-2 border-gray-100 p-6 bg-gray-50 sm:p-10 lg:p-6 xl:p-10">
                        <div className="flex  flex-shrink-0 items-start">
                          <svg
                            className="flex-shrink-0 h-6 w-6 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              fill="currentcolor"
                              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                            />
                          </svg>
                          <p className="ml-3 text-base font-medium text-gray-500">
                            Election Closed
                          </p>
                        </div>
                        <div className="mt-4">
                          <div className="rounded-lg shadow-md">
                            <button
                              className="block w-full text-center rounded-lg border border-transparent bg-white px-6 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 disabled:opacity-50"
                              aria-describedby="tier-scale"
                              disabled
                            >
                              Register for Election
                            </button>
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
      </div>
    </div>
  );
}
