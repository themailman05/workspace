import Navbar from 'containers/NavBar/NavBar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LandingPage } from '../components/Grants/LandingPage';

const IndexPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <div className="w-full bg-white h-screen flex flex-col justify-center">
      <div className="flex flex-row w-full h-5/6">
        <div className="w-1/2 h-full">
          <div className="flex flex-col justify-between w-1/2 mx-auto h-full">
            <Link href="/" passHref>
              <a>
                <img
                  src="/images/popcorn_v1_rainbow_bg.png"
                  alt="Logo"
                  className="rounded-full h-18 w-18"
                ></img>
              </a>
            </Link>
            <div className="text-left">
              <p className="uppercase text-2xl font-medium text-gray-400">
                Coming Soon
              </p>
              <h1 className="uppercase font-bold text-8xl text-gray-900">
                Popcorn
              </h1>
              <p className="uppercase text-3xl font-medium text-gray-900">
                Defi for the People
              </p>
            </div>
            <Link href="/docs/Popcorn_whitepaper_v1.pdf" passHref>
              <a className="underline text-3xl text-gray-900" target="_window">
                Read the whitepaper
              </a>
            </Link>
          </div>
        </div>
        <div className="w-1/2 h-full flex flex-col justify-center">
          <img
            src="/images/popcorn_playing.gif"
            alt="Playing in Popcorn"
            className=" rounded-l-full bg-white w-full h-full"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
