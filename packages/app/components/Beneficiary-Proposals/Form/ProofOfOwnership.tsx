import React from 'react';
import { FormStepProps } from './ProposalForm';
import ControlledTextInput from './ControlledTextInput';

export default function ProofOfOwnership({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  function updateProofOfOwnership(value: string): void {
    setForm({ ...form, proofOfOwnership: value });
  }

  function isValid(name: string): boolean {
    return name.length > 0;
  }

  return (
    visible && (
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
        <ControlledTextInput
          inputValue={form.proofOfOwnership}
          id="proofofownership"
          placeholder="Proof of Ownership"
          errorMessage="The proof of ownership cannot be left blank."
          updateInput={updateProofOfOwnership}
          isValid={isValid}
          navigation={navigation}
        />
      </div>
    )
  );
}
