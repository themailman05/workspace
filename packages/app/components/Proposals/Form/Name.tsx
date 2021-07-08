import React from 'react';
import { FormStepProps } from 'pages/proposals/propose';
import ControlledTextInput from './ControlledTextInput';
import inputExists from 'utils/isValidInput';
import ContinueButton from './ContinueButton';

export default function Name({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;

  function updateName(value: string): void {
    setFormData({ ...formData, organizationName: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          1 - First things first, what's the name of the beneficiary?
        </h2>
        <ControlledTextInput
          inputValue={formData.organizationName}
          id="name"
          placeholder="Beneficiary Name"
          errorMessage="Beneficiary name cannot be blank."
          updateInput={updateName}
          isValid={inputExists}
        />
        {inputExists(formData.organizationName) && (
          <ContinueButton {...navigation} />
        )}
      </div>
    )
  );
}
