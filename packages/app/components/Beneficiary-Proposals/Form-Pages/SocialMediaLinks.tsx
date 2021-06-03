import Link from 'next/link';
import React, { useState } from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/solid';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';

interface SocialMediaLinks {
  platform: string;
  url: string;
}

interface SMProps {
  socialMediaLinks: string;
  setSocialMediaLinks: UpdateState<string>;
}

function AddSocialMedia({
  socialMediaLinks,
  setSocialMediaLinks,
}: SMProps): JSX.Element {
  const [platform, setPlatform] = useState<string>('Facebook');
  const [url, setUrl] = useState<string>('');
  return (
    <div className="grid justify-items-stretch ...">
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
              {['Facebook', 'LinkedIn', 'Instagram', 'GitHub', 'Twitter'].map(
                (platform, i) => (
                  <option key={i} value={platform}>
                    {platform}
                  </option>
                ),
              )}
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
            onChange={(event) => setUrl(event.target.value)}
            value={url}
            placeholder="https://twitter.com/Popcorn_DAO"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-start pb-8">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {
              const platformData = JSON.stringify({ platform, url });
              // Filter out previous entries for platform and then add submitted platform
              const newPlatformData = JSON.parse(socialMediaLinks)
                .filter((socialMediaObj) => {
                  return socialMediaObj.platform !== platform;
                })
                .concat(JSON.parse(platformData))
                .sort((a, b) => a.platform - b.platform);
              setSocialMediaLinks(JSON.stringify(newPlatformData));
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function SocialMediaTable({ socialMediaLinks, setSocialMediaLinks }: SMProps) {
  return (
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Platform
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {JSON.parse(socialMediaLinks)
                .sort((a, b) => a.platform - b.platform)
                .map((socialMediaData, idx) => {
                  const { url, platform } = socialMediaData;
                  return (
                    <tr
                      key={platform}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={url}>{url}</Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href="#"
                          className="text-red-400 hover:text-red-900"
                          onClick={() => {
                            const newPlatformData = JSON.parse(
                              socialMediaLinks,
                            ).filter((socialMediaObj) => {
                              return socialMediaObj.platform !== platform;
                            });
                            setSocialMediaLinks(
                              JSON.stringify(newPlatformData),
                            );
                          }}
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SocialMediaLinks({
  currentStep,
  setCurrentStep,
  socialMediaLinks,
  setSocialMediaLinks,
  setStepLimit
}): JSX.Element {
  if (currentStep === 9) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          9 - Upload social media links
        </h2>
        <p className="mt-8 mb-6 block text-sm font-medium text-gray-700">
          Add links to your social media profiles.
        </p>
        <AddSocialMedia
          socialMediaLinks={socialMediaLinks}
          setSocialMediaLinks={setSocialMediaLinks}
        />
        <SocialMediaTable
          socialMediaLinks={socialMediaLinks}
          setSocialMediaLinks={setSocialMediaLinks}
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
