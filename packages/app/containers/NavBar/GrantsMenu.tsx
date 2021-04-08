import React from "react";
import { useRouter } from 'next/router';
import NavbarLink from "./NavbarLinks";

interface Props {
  visible: boolean;
  toggleSubMenu: Function;
}
export const GrantsMenu: React.FC<Props> = ({visible, toggleSubMenu}) => {
  const router = useRouter();
  if (!visible) return <></>;
  return (
  <div className="absolute z-10 inset-x-0 transform shadow-lg">
  <div className="absolute inset-0 flex" aria-hidden="true">
    <div className="bg-white w-full"></div>
  </div>
  <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
    <nav className="grid gap-y-10 px-4 py-8 bg-white sm:grid-cols-2 sm:gap-x-8 sm:py-12 sm:px-6 lg:px-8 xl:pr-12" aria-labelledby="solutionsHeading">
      <div>
        <h3 className="text-sm font-medium tracking-wide text-gray-500 uppercase">
          Grants
        </h3>
        <ul className="mt-5 space-y-6">
          <li className="flow-root">
            <span className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150">
              <svg className="flex-shrink-0 h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-4"> 
                <NavbarLink
                  label="View All Grants"
                  url="/grant-elections/all"
                  onClick={toggleSubMenu}
                  isActive={router.pathname === '/grants'}
                />
              </span>
            </span>
          </li>

          <li className="flow-root">
            <a href="#" className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150">
              <svg className="flex-shrink-0 h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="ml-4">Register for a Grant</span>
            </a>
          </li>

        </ul>
      </div>
      </nav>
  </div>
</div>);
}