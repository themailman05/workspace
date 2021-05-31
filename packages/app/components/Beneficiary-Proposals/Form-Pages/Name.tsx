import React from 'react';
import { ExclamationCircleIcon, CheckIcon } from '@heroicons/react/solid';
import useLocalStorageState from 'use-local-storage-state';

export default function Name({ currentStep, setCurrentStep }): JSX.Element {
  const [name, setName] = useLocalStorageState<string>('name', '');
  if (currentStep === 1) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <p className="max-w-4xl text-xl text-black sm:text-2xl my-4">
          1 - First things first, what's the name of the beneficiary?
        </p>
        {name.length > 0 ? (
          <React.Fragment>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Beneficiary Name"
              />
            </div>
            <div className="grid justify-items-stretch">
              <button
                onClick={() => setCurrentStep(currentStep++)}
                className=" justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                OK
                <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </React.Fragment>
        ) : (
          <div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                placeholder="Beneficiary Name"
                aria-invalid="true"
                aria-describedby="email-error"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              Beneficiary name cannot be blank.
            </p>
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
