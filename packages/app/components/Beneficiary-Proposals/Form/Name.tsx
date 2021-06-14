import React from 'react';
import { FormStepProps } from './ProposalForm';
import ControlledTextInput from './ControlledTextInput';

export default function Name({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;
  function isValid(name): boolean {
    return name.length > 0;
  }
  function updateName(value: string): void {
    setFormData({ ...formData, name: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          1 - First things first, what's the name of the beneficiary?
        </h2>
        <ControlledTextInput
          inputValue={formData.name}
          id="name"
          placeholder="Beneficiary Name"
          errorMessage="Beneficiary name cannot be blank."
          updateInput={updateName}
          isValid={isValid}
          navigation={navigation}
        />
      </div>
    )
  );
}
