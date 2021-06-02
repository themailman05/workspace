import Link from 'next/link';
import useLocalStorageState from 'use-local-storage-state';
import React from 'react';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid';

import * as Icon from 'react-feather';

interface SocialMediaLinks {
  name: string;
  url: string;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function SocialMediaMenu() {
  return (
    <div className="col-span-6 sm:col-span-3">
      <label
        htmlFor="country"
        className="block text-sm font-medium text-gray-700"
      >
        Select Platform
      </label>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                Select Platform
                <ChevronDownIcon
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.Linkedin className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        LinkedIn
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.Facebook className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Facebook
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.Instagram className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Instagram
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.Dribbble className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Dribbble
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.GitHub className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        GitHub
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item onClick={() => window.alert("Twitter") }>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'group flex items-center px-4 py-2 text-sm',
                        )}
                      >
                        <Icon.Twitter className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Twitter
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
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

function AddSocialMedia() {
  return (
    <div className="grid justify-items-stretch ...">
      <div className="mt-5 md:mt-0 md:col-span-2 space-y-5">
        <SocialMediaMenu />
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
            placeholder="https://twitter.com/Popcorn_DAO"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-start pb-8">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SocialMediaLinks({
  currentStep,
  setCurrentStep,
}): JSX.Element {
  const [socialMediaLinks, setSocialMediaLinks] = useLocalStorageState<
    SocialMediaLinks[]
  >('socialMediaLinks', []);
  if (currentStep === 9) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          9 - Upload social media links
        </h2>
        <p className="mt-8 mb-6 block text-sm font-medium text-gray-700">
          Add links to your social media profiles.
        </p>
        <AddSocialMedia />
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
