import FacebookPixel from 'components/FacebookPixel';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Facebook, GitHub, Twitter } from 'react-feather';

const IndexPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <div className="font-landing">
      <FacebookPixel />
      <header className="w-full bg-primary">
        <nav className="w-10/12 mx-auto pt-12 pb-6 border-b border-white flex flex-row items-center justify-between">
          <div>
            <Link href="/" passHref>
              <a>
                {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                <img src="/images/logo.png" alt="Logo" className="h-10"></img>
              </a>
            </Link>
          </div>
          <div className="space-x-8">
            <Link href="/" passHref>
              <a className="font-medium text-base">About us</a>
            </Link>
            <Link href="/" passHref>
              <a className="font-medium text-base">Products</a>
            </Link>
            <Link href="/" passHref>
              <a className="font-medium text-base">Whitepaper</a>
            </Link>
            <Link href="/" passHref>
              <a className="font-medium text-base">PopcornDAO</a>
            </Link>
            <Link href="/" passHref>
              <a className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4">
                Early Access
              </a>
            </Link>
          </div>
        </nav>
      </header>
      <section className="h-screen">
        <div className="w-full h-28 bg-primary"></div>
        <div
          className="bg-hero-pattern flex-shrink-0 flex-grow-0 w-full h-full"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="w-10/12 mx-auto flex flex-row justify-between">
            <div className="w-5/12">
              <div className="w-10/12">
                <h1 className="font-bold text-7xl leading-snug mb-8">
                  Start doing good with DeFi
                </h1>
                <p className="text-2xl font-landing">
                  Earn high yield on your cryptoassets while creating real world
                  impact. Our earnings fund social impact organizations.
                </p>
                <form
                  action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
                  method="post"
                  id="mc-embedded-subscribe-form"
                  name="mc-embedded-subscribe-form"
                  className="validate"
                  target="_blank"
                  noValidate
                >
                  <div
                    id="mc_embed_signup_scroll"
                    className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-full flex flex-row items-center justify-between"
                  >
                    <input
                      type="email"
                      name="EMAIL"
                      className="w-10/12 p-2 text-base mx-4 text-gray-900"
                      id="mce-EMAIL"
                      placeholder="Email Address"
                      required
                    />
                    <div
                      style={{ position: 'absolute', left: '-5000px' }}
                      aria-hidden="true"
                    >
                      <input
                        type="text"
                        name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="clear">
                      <input
                        type="submit"
                        value="Join Waitlist"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="button pb-2 button-primary bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 flex flex-col items-center justify-center cursor-pointer"
                        readOnly
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="w-7/12">
              <img src="/images/catPool.svg" alt="pool" className=""></img>
            </div>
          </div>
        </div>
      </section>
      <section className="w-10/12 mx-auto mb-24">
        <h2 className="font-bold text-6xl mb-4">How it works</h2>
        <p className="text-2xl font-landing text-gray-500">
          Put your cryptoassets to work
        </p>
        <div className="w-full flex flex-row justify-between mt-16">
          <div className="w-1/4">
            <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/metamaskCat.svg"
                  alt="metamaskCat"
                  className="mx-auto mb-1"
                ></img>
              </div>
              <h3 className="font-medium text-4xl py-8">Connect</h3>
              <p className="w-3/4 text-center text-xl text-gray-500">
                Connect your Metamask wallet with Popcorn
              </p>
            </div>
          </div>
          <div className="w-1/4">
            <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/vault.svg"
                  alt="vault"
                  className="mx-auto mb-2"
                ></img>
              </div>
              <h3 className="font-medium text-4xl py-8">Deposit</h3>
              <p className="w-3/4 text-center text-xl text-gray-500">
                Deposit your crypto and choose a product or strategy
              </p>
            </div>
          </div>
          <div className="w-1/4">
            <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/popcornVault.svg"
                  alt="popcornVault"
                  className="mx-auto mt-2"
                ></img>
              </div>
              <h3 className="font-medium text-4xl py-8">Do well</h3>
              <p className="w-3/4 text-center text-xl text-gray-500">
                Earn competitive returns on you crypto assets
              </p>
            </div>
          </div>
          <div className="w-1/4">
            <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/catMail.svg"
                  alt="catMail"
                  className="mx-auto mb-1"
                ></img>
              </div>
              <h3 className="font-medium text-4xl py-8">Do good</h3>
              <p className="w-3/4 text-center text-xl text-gray-500">
                Choose which social impact organization you’d like to help
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        className="bg-popcorn1-pattern flex-shrink-0 flex-grow-0 w-full h-full mb-24"
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          backgroundPosition: 'left top',
        }}
      >
        <div className="w-10/12 mx-auto pt-20 flex flex-row justify-between items-center">
          <div className="w-5/12">
            <h2 className="w-11/12 font-bold text-6xl leading-snug mb-4">
              Maximize your Crypto Portfolio
            </h2>
            <p className="text-2xl font-landing text-gray-500">
              Popcorn offers a suite of DeFi products and hedge fund strategies
              for you to generate competitive returns on your crypto assets.
            </p>
            <img
              src="/images/bgPopcorn2.svg"
              alt="bgPopcorn2"
              className="mx-auto"
            ></img>
          </div>
          <div className="w-6/12">
            <img src="/images/rocket.svg" alt="rocket" className=""></img>
          </div>
        </div>
      </section>
      <section
        className="bg-impact-pattern flex-shrink-0 flex-grow-0 w-full h-full py-12"
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          backgroundPosition: 'center',
        }}
      >
        <div className="w-10/12 mx-auto pt-64 pb-96 flex flex-row justify-between items-center">
          <div className="w-8/12"></div>
          <div className="w-4/12">
            <h2 className="w-9/12 font-bold text-6xl leading-snug mb-4">
              Create Real World Impact
            </h2>
            <p className="w-10/12 text-2xl font-landing text-gray-500">
              Our profits fund social impact organizations. Choose which
              initiatives you support:
            </p>
            <ul className="list-inside list-disc mt-8 space-y-3">
              <li className="text-2xl font-medium font-landing">Environment</li>
              <li className="text-2xl font-medium font-landing">Open Source</li>
              <li className="text-2xl font-medium font-landing">Education</li>
            </ul>
          </div>
        </div>
      </section>
      <section
        className="bg-popcorn3-pattern flex-shrink-0 flex-grow-0 w-full h-full mb-24"
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          backgroundPosition: 'left top',
        }}
      >
        <div className="w-10/12 mx-auto pt-20 flex flex-row justify-between items-center">
          <div className="w-5/12">
            <h2 className="w-11/12 font-bold text-6xl leading-snug mb-4">
              While Remaining Carbon Neutral
            </h2>
            <p className="text-2xl font-landing text-gray-500">
              Popcorn calcualtes and neutralizes blockchain carbon emissions by
              partnering with carbon sequestration and negative emission
              projects.
            </p>
          </div>
          <div className="w-6/12">
            <img src="/images/tree.svg" alt="tree" className=""></img>
          </div>
        </div>
      </section>
      <section>
        <div
          className="bg-countdown-pattern flex-shrink-0 flex-grow-0 w-full
          h-full pt-60"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            backgroundPosition: 'center',
          }}
        >
          <div className="w-full pt-32">
            <div className="w-10/12 mx-auto rounded-xl shadow-xl bg-white">
              <h3 className="font-medium text-4xl pt-20 pb-12 text-center">
                Don’t miss the liquidity event!
              </h3>
              <div className="w-9/12 mx-auto flex flex-row justify-between pb-20">
                <div className="text-center">
                  <h1 className="font-bold text-7xl leading-snug">33</h1>
                  <p className="text-3xl font-landing text-gray-500">Days</p>
                </div>
                <div className="text-center">
                  <h1 className="font-bold text-7xl leading-snug">18</h1>
                  <p className="text-3xl font-landing text-gray-500">Hours</p>
                </div>
                <div className="text-center">
                  <h1 className="font-bold text-7xl leading-snug">09</h1>
                  <p className="text-3xl font-landing text-gray-500">Minutes</p>
                </div>
                <div className="text-center">
                  <h1 className="font-bold text-7xl leading-snug">59</h1>
                  <p className="text-3xl font-landing text-gray-500">Seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full bg-secondary py-52">
        <div className="w-8/12 mx-auto text-center">
          <h2 className="font-bold text-4xl leading-snug mb-4">Notify Me</h2>
          <p className="text-2xl font-medium">
            Can’t wait to see you when we are launching. Get earlier
            notification to be part of our journey
          </p>
          <form
            action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="validate"
            target="_blank"
            noValidate
          >
            <div
              id="mc_embed_signup_scroll"
              className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-8/12 mx-auto flex flex-row items-center justify-between"
            >
              <input
                type="email"
                name="EMAIL"
                className="w-10/12 p-2 text-base mx-4 text-gray-900"
                id="mce-EMAIL"
                placeholder="Email Address"
                required
              />
              <div
                style={{ position: 'absolute', left: '-5000px' }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                  tabIndex={-1}
                />
              </div>
              <div className="clear">
                <input
                  type="submit"
                  value="Join Waitlist"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  className="button pb-2 button-primary bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 flex flex-col items-center justify-center cursor-pointer"
                  readOnly
                />
              </div>
            </div>
          </form>
        </div>
      </section>
      <section className="w-full bg-secondary">
        <div className="w-10/12 mx-auto flex flex-row justify-between border-b border-gray-500 pb-12">
          <div className="w-6/12">
            <Link href="/" passHref>
              <a>
                {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                <img src="/images/logo.png" alt="Logo" className="h-10"></img>
              </a>
            </Link>
            <p className="font-medium text-base w-7/12 py-4">
              Popcorn is a carbon-neutral crypto savings account where fees fund
              educational, environmental and open source initiatives
            </p>
            <div className="flex flex-row space-x-4">
              <Link href="/" passHref>
                <GitHub />
              </Link>
              <Link href="/" passHref>
                <Facebook />
              </Link>
              <Link href="/" passHref>
                <Twitter />
              </Link>
              <Link href="/" passHref>
                <Twitter />
              </Link>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <p className="font-medium text-base uppercase">Site</p>
            <Link href="/" passHref>
              <a>Home</a>
            </Link>
            <Link href="/" passHref>
              <a>About us</a>
            </Link>
            <Link href="/" passHref>
              <a>Blog</a>
            </Link>
          </div>
          <div className="flex flex-col space-y-3">
            <p className="font-medium text-base uppercase">Connect</p>
            <Link href="/" passHref>
              <a>Twitter</a>
            </Link>
            <Link href="/" passHref>
              <a>Discord</a>
            </Link>
            <Link href="/" passHref>
              <a>Github</a>
            </Link>
          </div>
          <div className="flex flex-col space-y-3">
            <p className="font-medium text-base uppercase">Documentation</p>
            <Link href="/" passHref>
              <a>Gitbook</a>
            </Link>
          </div>
        </div>
        <p className="font-base text-center py-4">
          ©2021, Popcorn Network. All Rights Reserved
        </p>
      </section>
    </div>
  );
};

export default IndexPage;
