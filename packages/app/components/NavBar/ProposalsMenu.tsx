import { useRouter } from 'next/router';
import NavbarLink from './NavbarLinks';
import * as Icon from 'react-feather';

interface Props {
  visible: boolean;
  toggleSubMenu: Function;
}
export const ProposalsMenu: React.FC<Props> = ({ visible, toggleSubMenu }) => {
  const router = useRouter();
  return visible && (
    <div className="absolute z-10 left-4/5 transform  -translate-x-1 mt-5 px-2 w-screen max-w-xs sm:px-0">
      <nav
        className="mx-auto px-4 py-8 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
        aria-labelledby="solutionsHeading"
      >
        <div>
          <ul className="space-y-6">
            <li className="flow-root">
              <span className="-m-3 p-3 flex items-center text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150">
                <Icon.Info className="mr-4" />
                <NavbarLink
                  label="View Beneficiary Proposals"
                  url="/beneficiary-proposals"
                  onClick={toggleSubMenu}
                  isActive={router.pathname === '/beneficiary-proposals'}
                />
              </span>
            </li>
            <li className="flow-root">
              <span className="-m-3 p-3 flex items-center text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150">
                <Icon.Info className="mr-4" />
                <NavbarLink
                  label="View Beneficiary Takedown Proposals"
                  url="/beneficiary-proposals/takedowns"
                  onClick={toggleSubMenu}
                  isActive={
                    router.pathname === '/beneficiary-takedown-proposals'
                  }
                />
              </span>
            </li>

            <li className="flow-root">
              <span className="-m-3 p-3 flex items-center text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150">
                <Icon.Plus className="mr-4" />
                <NavbarLink
                  label="Propose a New Beneficiary"
                  url="/beneficiary-proposals/propose"
                  onClick={toggleSubMenu}
                  isActive={
                    router.pathname === '/beneficiary-proposals/propose'
                  }
                />
              </span>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};
