import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/solid';
import SocialMediaTable from './SocialMediaTable';
import { FormStepProps } from './ProposalForm';

export default function SocialMedia({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const [platform, setPlatform] = useState<string>('Facebook');

  
  function getUrl(platform) {
    switch (platform) {
      case 'Twitter': {
        return form.twitterUrl;
      }
      case 'LinkedIn': {
        return form.linkedinUrl;
      }
      case 'Instagram': {
        return form.instagramUrl;
      }
      case 'GitHub': {
        return form.githubUrl;
      }
      case 'Facebook': {
        return form.facebookUrl;
      }
    }
  }

  function setUrl(event) {
    const url = event.target.value;
    switch (platform) {
      case 'Twitter': {
        setForm({ ...form, twitterUrl: url });
        break;
      }
      case 'LinkedIn': {
        setForm({ ...form, linkedinUrl: url });
        break;
      }
      case 'Instagram': {
        setForm({ ...form, instagramUrl: url });
        break;
      }
      case 'GitHub': {
        setForm({ ...form, githubUrl: url });
        break;
      }
      case 'Facebook': {
        setForm({ ...form, facebookUrl: url });
        break;
      }
    }
  }


  if (visible) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          9 - Upload social media links
        </h2>

        <div className="grid justify-items-stretch ...">
          <p className="mt-8 mb-6 block text-sm font-medium text-gray-700">
            Add links to your social media profiles.
          </p>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-5">
            <div className="col-span-6 sm:col-span-3">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  defaultValue="Facebook"
                  onChange={(event) => setPlatform(event.target.value)}
                  value={platform}
                >
                  {[
                    'Facebook',
                    'LinkedIn',
                    'Instagram',
                    'GitHub',
                    'Twitter',
                  ].map((platform, i) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-6">
              <label
                htmlFor="street_address"
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <input
                type="text"
                name="url"
                id="url"
                onChange={setUrl}
                value={getUrl(platform)}
                placeholder="https://twitter.com/Popcorn_DAO"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <SocialMediaTable
          form={form}
          setForm={setForm}
        />
        <div className="row-auto my-2 justify-self-center">
          <button
            onClick={() => {
              setStepLimit(currentStep + 1);
              setCurrentStep(currentStep + 1);
            }}
            className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            OK
            <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
