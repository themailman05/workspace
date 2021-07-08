import React from 'react';
import { FormStepProps } from 'pages/proposals/propose';
import ControlledTextInput from './ControlledTextInput';

export default function Website({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;

  
  function isValid(website): boolean {
    return website.length > 0;
  }
  function updateWebsite(value: string): void {
    setFormData({ ...formData, website: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          9 - Whats the website of your Beneficiary?
        </h2>
        <ControlledTextInput
          inputValue={formData.website}
          id="website"
          placeholder="Website"
          errorMessage="Website URL cannot be blank."
          updateInput={updateWebsite}
          isValid={isValid}
          navigation={navigation}
        />
      </div>
    )
  );
}
