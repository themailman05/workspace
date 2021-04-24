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
    <div
      className="w-full h-screen flex flex-col justify-center font-landing"
      style={{ backgroundColor: '#F8F8FB' }}
    >
      <div className="hidden xl:flex flex-row w-full h-5/6">
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
              <p className="text-3xl text-gray-900">DeFi for the People</p>
              <div className="bg-white rounded-full py-2 px-2 mt-8 w-full border border-gray-400 flex flex-row items-center justify-between">
                <input
                  className="w-10/12 px-2"
                  type="text"
                  placeholder="Email Address"
                ></input>
                <button className="button button-primary bg-ctaYellow hover:bg-ctaYellowLight text-gray-800 hover:text-gray-900 rounded-full h-8 flex items-center">
                  Notify Me!
                </button>
              </div>
            </div>
            <Link href="/docs/Popcorn_whitepaper_v1.pdf" passHref>
              <a
                className="text-3xl text-gray-900 font-light border-b-2  border-black w-max"
                target="_window"
              >
                Read the whitepaper
              </a>
            </Link>
          </div>
        </div>
        <div className="w-1/2 h-full flex flex-col justify-center">
          <div
            className="bg-hero-pattern flex-shrink-0 flex-grow-0 rounded-l-full bg-white w-full h-full"
            style={{
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </div>
      </div>
      <div className="flex xl:hidden flex-col w-full h-full pt-12 md:pt-18">
        <div className="w-full h-1/2 flex flex-row justify-end">
          <div className="flex flex-row w-11/12 h-full">
            <Link href="/" passHref>
              <a>
                <img
                  src="/images/popcorn_v1_rainbow_bg.png"
                  alt="Logo"
                  className="rounded-full h-12 w-12 md:h-14 md:w-14 absolute"
                ></img>
              </a>
            </Link>
            <div
              className="bg-hero-pattern flex-shrink-0 flex-grow-0 rounded-l-full bg-white w-full h-full"
              style={{
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </div>
        <div className="w-full h-1/2 flex flex-row justify-end">
          <div className="flex flex-col justify-between w-11/12 h-5/6 my-auto">
            <div className="text-left">
              <p className="uppercase text-xl md:text-2xl font-medium text-gray-400">
                Coming Soon
              </p>
              <h1 className="uppercase font-bold text-6xl md:text-8xl text-gray-900">
                Popcorn
              </h1>
              <p className="text-2xl md:text-3xl text-gray-900">
                DeFi for the People
              </p>
              <div className="bg-white rounded-full py-2 px-2 mt-8 w-10/12 border border-gray-400 flex flex-row items-center justify-between">
                <input
                  className="w-10/12 px-2"
                  type="text"
                  placeholder="Email Address"
                ></input>
                <button
                  className="button rounded-full h-10 md:h-8 flex items-center"
                  style={{ background: '#F6CB22' }}
                >
                  Notify Me!
                </button>
              </div>
            </div>
            <Link href="/docs/Popcorn_whitepaper_v1.pdf" passHref>
              <a
                className="text-xl md:text-3xl text-gray-900 font-light border-b md:border-b-2 border-black w-max"
                target="_window"
              >
                Read the whitepaper
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
