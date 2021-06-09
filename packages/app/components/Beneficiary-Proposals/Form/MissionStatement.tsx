import React, { useState } from 'react';
import { ExclamationCircleIcon, CheckIcon } from '@heroicons/react/solid';
import { Form, Navigation } from './ProposalForm';
import { useEffect } from 'react';

interface MSProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function MissionStatement({
  form,
  setForm,
  navigation,
  visible,
}: MSProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const [missionStatement, setMissionStatement] = useState<string>('');

  useEffect(() => {
    setMissionStatement(form?.missionStatement)
  }, [form])
  
  useEffect(() => {
    // handle input validation and updating parent form
    if (isValid(missionStatement)) {
      setForm({ ...form, missionStatement });
    }
  }, [missionStatement]);

  const isValid = (missionStatement) => missionStatement.length > 0

  if (visible) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          3 - Please share the beneficiary's mission statement
        </h2>
        {missionStatement.length > 0 ? (
          <React.Fragment>
            <div className="mt-1 relative rounded-md shadow-sm">
              <textarea
                name="missionstatement"
                id="missionstatement"
                rows={10}
                value={missionStatement}
                onChange={(event) => setMissionStatement(event.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Mission Statement"
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
              <textarea
                name="name"
                id="name"
                rows={10}
                value={missionStatement}
                onChange={(event) => setMissionStatement(event.target.value)}
                className="block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                placeholder="Mission Statement"
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
              The mission statement cannot be blank.
            </p>
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
