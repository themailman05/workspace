import React from 'react';
import web3 from 'web3';
import useLocalStorageState from 'use-local-storage-state';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export default function EtherumAddress({
  currentStep,
  setCurrentStep,
}): JSX.Element {
  const [ethereumAddress, setEthereumAddress] =
    useLocalStorageState<string>('');
  if (currentStep === 2) {
    return (
      <div className="mx-14 my-14 content-center justify-items-center">
        <p className="max-w-4xl text-xl text-black sm:text-2xl">
          What's the Ethereum address grants will be sent to?
        </p>
        {web3.utils.isAddress(ethereumAddress) ? (
          <React.Fragment>
            <div className="mt-1 w-1/2">
              <input
                type="text"
                name="ethaddress"
                id="ethaddress"
                value={ethereumAddress}
                onChange={(event) => setEthereumAddress(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Beneficiary Name"
              />
            </div>
            <button
              onClick={() => setCurrentStep(currentStep++)}
              className="my-4 justify-self-center inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              OK
            </button>
          </React.Fragment>
        ) : (
          <div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="ethaddress"
                id="ethaddress"
                value={ethereumAddress}
                onChange={(event) => setEthereumAddress(event.target.value)}
                className="block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                placeholder="Etherum Address"
                aria-invalid="true"
                aria-describedby="eth-address-error"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              Please enter a valid ethereum address
            </p>
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
