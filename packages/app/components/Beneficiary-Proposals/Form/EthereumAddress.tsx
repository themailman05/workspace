import React from 'react';
import web3 from 'web3';
import { ExclamationCircleIcon, CheckIcon } from '@heroicons/react/solid';
import { Form, Navigation } from './ProposalForm';

interface EProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function EtherumAddress({
  form,
  setForm,
  navigation,
  visible,
}: EProps): JSX.Element {
  const { currentStep, setStepLimit, setCurrentStep } = navigation;

  function updateEthereumAddress(event) {
    const ethereumAddress = event.target.value;
    // handle input validation and updating parent form
    if (web3.utils.isAddress(ethereumAddress)) {
      setForm({ ...form, ethereumAddress });
    }
  }

  if (visible) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          2 - What's the Ethereum address grants will be sent to?
        </h2>
        {web3.utils.isAddress(form.ethereumAddress) ? (
          <React.Fragment>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="ethaddress"
                id="ethaddress"
                value={form.ethereumAddress}
                onChange={updateEthereumAddress}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Ethererum Address"
              />
            </div>
            <div className="grid justify-items-stretch">
              <button
                onClick={() => {
                  setStepLimit(currentStep + 1);
                  setCurrentStep(currentStep + 1);
                }}
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
                name="ethaddress"
                id="ethaddress"
                value={form.ethereumAddress}
                onChange={updateEthereumAddress}
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
