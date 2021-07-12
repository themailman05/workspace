import React from 'react';
import { FormStepProps } from 'pages/proposals/propose';
import ControlledTextInput from './ControlledTextInput';

export default function ContactEmail({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;

  function isValid(email): boolean {
    return email.length > 0;
  }
  function updateName(value: string): void {
    setFormData({ ...formData, contactEmail: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          {navigation.currentStep+1} - Please enter a contact email address
        </h2>
        <ControlledTextInput
          inputValue={formData.contactEmail}
          id="contactEmail"
          placeholder="Contact Email"
          errorMessage="Contact email cannot be blank."
          updateInput={updateName}
          isValid={isValid}
          navigation={navigation}
        />
      </div>
    )
  );
}
