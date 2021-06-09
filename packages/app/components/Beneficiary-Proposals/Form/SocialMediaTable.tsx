// Display table that contains platform, url and option to delete

import { TrashIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import React from 'react';

export default function SocialMediaTable({ form, setForm }) {
  const { twitterUrl, linkedinUrl, facebookUrl, instagramUrl, githubUrl } =
    form;
  function clearUrl(platform) {
    switch (platform) {
      case 'Twitter': {
        setForm({ ...form, twitterUrl: "" });
        break;
      }
      case 'LinkedIn': {
        setForm({ ...form, linkedinUrl: "" });
        break;
      }
      case 'Instagram': {
        setForm({ ...form, instagramUrl: "" });
        break;
      }
      case 'GitHub': {
        setForm({ ...form, githubUrl: "" });
        break;
      }
      case 'Facebook': {
        setForm({ ...form, facebookUrl: "" });
        break;
      }
    }
  }
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
              {twitterUrl !== '' ? (
                <tr key={twitterUrl + 1}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Twitter
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={twitterUrl}>{twitterUrl}</Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => {
                        clearUrl("Twitter")
                      }}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}

              {linkedinUrl !== '' ? (
                <tr key={linkedinUrl + 2}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    LinkedIn
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={linkedinUrl}>{linkedinUrl}</Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => {
                        clearUrl("LinkedIn")
                      }}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}

              {facebookUrl !== '' ? (
                <tr key={facebookUrl + 3}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Facebook
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={facebookUrl}>{facebookUrl}</Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => {
                        clearUrl("Facebook")
                      }}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}
              {githubUrl !== '' ? (
                <tr key={githubUrl + 4}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GitHub
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={githubUrl}>{githubUrl}</Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => {
                        clearUrl("GitHub")
                      }}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}
              {instagramUrl !== '' ? (
                <tr key={instagramUrl + 5}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Instagram
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={instagramUrl}>{instagramUrl}</Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-red-400 hover:text-red-900"
                      onClick={() => {
                        clearUrl("Instagram")
                      }}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
