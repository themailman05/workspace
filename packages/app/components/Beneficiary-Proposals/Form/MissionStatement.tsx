import React from 'react';
import { FormStepProps } from './ProposalForm';
import ControlledTextInput from './ControlledTextInput';

export default function MissionStatement({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {

  function updateMissionStatement(value: string): void {
    setForm({ ...form, missionStatement: value });
  }

  function isValid(missionStatement: string): boolean {
    return missionStatement.length > 0;
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          3 - Please share the beneficiary's mission statement
        </h2>
        <ControlledTextInput
          inputValue={form.missionStatement}
          id="missionstatement"
          placeholder="Mission Statement"
          errorMessage="The mission statement cannot be blank."
          updateInput={updateMissionStatement}
          isValid={isValid}
          navigation={navigation}
        />
      </div>
    )
  );
}
