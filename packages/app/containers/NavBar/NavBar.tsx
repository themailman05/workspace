import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { connectors } from 'containers/Web3/connectors';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import NavbarLink from './NavbarLinks';
import { GrantsMenu } from './GrantsMenu';

export default function Navbar(): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const router = useRouter();
  const [showGrants, setShowGrants] = useState(false);
  const hideSubMenu = () => {
    setShowGrants(false);
  }
  
  return (
    <>
    <nav
      className="flex shadow-md py-3 mb-8 px-14"
      style={{
        background: 'rgba(255, 255, 255, .5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div>
        <Link href="/" passHref>
          <a>
            <img
              src="/images/popcorn_v1_dark_bg.png"
              alt="Logo"
              className="w-8 h-8"
            ></img>
          </a>
        </Link>
      </div>
      <ul className="flex flex-row items-center mx-auto space-x-4">
        <NavbarLink
          label="Grants"
          onClick={() => setShowGrants(!showGrants)}
          isActive={router.pathname === '/grants'}
        />
        <NavbarLink
          label="Staking"
          url="/staking"
          isActive={router.pathname === '/staking'}
        />
      </ul>
      <button
        className="w-28 p-1 flex flex-row items-center justify-center border border-gray-400 rounded hover:bg-gray-50"
        onClick={() => activate(connectors.Injected)}
      >
        <p>Connect{account && 'ed'}</p>
        {account && (
          <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
        )}
      </button>
    </nav>
    <GrantsMenu visible={showGrants} toggleSubMenu={() => setShowGrants(!showGrants)} />
    </>
  );
}
