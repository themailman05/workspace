import React from 'react';
import { FormStepProps } from './ProposalForm';
import ControlledTextInput from './ControlledTextInput';

export default function Name({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {

  function isValid(name): boolean {
    return name.length > 0;
  }
  function updateName(value: string): void {
    setForm({ ...form, name: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          1 - First things first, what's the name of the beneficiary?
        </h2>
        <ControlledTextInput
          inputValue={form.name}
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
