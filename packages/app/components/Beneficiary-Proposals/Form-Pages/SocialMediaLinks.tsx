import { TrashIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import useLocalStorageState from 'use-local-storage-state';
import React from 'react';

interface SocialMediaLinks {
  name: string;
  url: string;
}
/* This example requires Tailwind CSS v2.0+ */
const people = [
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },
  {
    platform: 'Twitter',
    url: 'www.twitter.com/balajis',
  },

  // More people...
];

export default function SocialMediaLinks({ currentStep, setCurrentStep }): JSX.Element {
  const [socialMediaLinks, setSocialMediaLinks] = useLocalStorageState<
  SocialMediaLinks[]
>('socialMediaLinks', []);
  if (currentStep === 9) {
    return (
      <div className="flex flex-col w-2/3 content-center ">
        <p className="mb-6 text-xl text-black ">
          You can add icons for your preferred social media profiles, such as
          Facebook, LinkedIn, Instagram, and more. These social media badges
          will then show up on your organisation's proposal page.
        </p>
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
                  {people.map((person, personIdx) => (
                    <tr
                      key={person.platform}
                      className={
                        personIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {person.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={person.url}>{person.url}</Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href="#"
                          className="text-red-400 hover:text-red-900"
                          onClick={() => console.log({ personIdx })}
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
