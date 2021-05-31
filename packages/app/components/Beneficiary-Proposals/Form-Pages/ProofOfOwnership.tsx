import React from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export default function ProofOfOwnership({
  currentStep,
  setCurrentStep,
}): JSX.Element {
  const [proofOfOwnership, setProofOfOwnership] = useLocalStorageState<string>(
    'proofOfOwnership',
    '',
  );
  if (currentStep === 4) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <p className="max-w-4xl text-xl text-black sm:text-2xl my-4">
          4 - Please share a proof of ownership
        </p>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Post the Ethereum address shared in step 2 on the beneficiary's
          website or a tweet on the beneficiary's official Twitter account.
        </label>
        {proofOfOwnership.length > 0 ? (
          <React.Fragment>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="poo"
                id="poo"
                value={proofOfOwnership}
                onChange={(event) => setProofOfOwnership(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Proof of ownership"
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
                name="proofofownership"
                id="proofofownership"
                value={proofOfOwnership}
                onChange={(event) => setProofOfOwnership(event.target.value)}
                className="block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                placeholder="Proof of ownership"
                aria-invalid="true"
                aria-describedby="proof-of-ownership-error"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              The proof of ownership cannot be left blank
            </p>
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
