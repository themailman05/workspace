import React, { useEffect, useState } from 'react';
import { ExclamationCircleIcon, CheckIcon } from '@heroicons/react/solid';
import { Form, Navigation } from './ProposalForm';

interface PoPProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function ProofOfOwnership({
  form,
  setForm,
  navigation,
  visible,
}: PoPProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const [proofOfOwnership, setProofOfOwnership] = useState<string>('');
  
  useEffect(() => {
    setProofOfOwnership(form?.proofOfOwnership)
  }, [form])
  
  useEffect(() => {
    // handle input validation and updating parent form
    if (isValid(proofOfOwnership)) {
      setForm({ ...form, proofOfOwnership });
    }
  }, [proofOfOwnership]);

  function isValid(name) {
    return name.length > 0;
  }

  if (visible) {
    return (
      <div className="mx-auto content-center justify-items-center px-10">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          4 - Proof of ownership
        </h2>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Input the Ethereum address shared in step 2 on the beneficiary's
          website or a tweet on the beneficiary's official Twitter account.
        </label>
        {proofOfOwnership.length > 0 ? (
          <React.Fragment>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="proofofownership"
                id="proofofownership"
                value={proofOfOwnership}
                onChange={(event) => setProofOfOwnership(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Proof of ownership"
              />
            </div>
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
