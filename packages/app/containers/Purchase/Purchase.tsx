import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useState, useEffect, useContext } from 'react';
import { connectors } from '../../containers/Web3/connectors';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import NavBar from '../../containers/NavBar/NavBar';
import { ContractsContext } from 'app/contracts';
import 'rc-slider/assets/index.css';
import MainActionButton from 'components/MainActionButton';
import { store } from 'app/store';
import {
  setSingleActionModal,
  pushNotification,
  hideNotification,
  clearNotifications,
} from '../../app/actions';

const IndexPage = () => {
  const { account, activate, active, library } = useWeb3React<Web3Provider>();
  const { contracts } = useContext(ContractsContext);
  const { dispatch } = useContext(store);
  const [isParticipant, setIsParticipant] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [popToPurchase, setPopToPurchase] = useState(0);
  const [purchaseAmountUSDC, setPurchaseAmount] = useState(0);
  const [isTxPending, setIsTxPending] = useState(false);
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  });

  const handleError = (err) => {
    setIsTxPending(false);
    dispatch(clearNotifications());
    dispatch(
      setSingleActionModal({
        title: 'Error',
        type: 'error',
        content: err.message,
        onConfirm: {
          label: 'Go Back',
          onClick: () => dispatch(setSingleActionModal(false)),
        },
      }),
    );
  };

  const approvePurchase = () => {
    const id = new Date().getTime();
    setIsTxPending(true);
    contracts.USDC.on('Approval', (owner, spender, value) => {
      setAllowance(parseInt(formatFixed(value, 6)));
      setIsTxPending(false);
      dispatch(hideNotification(id));
      dispatch(setSingleActionModal(false));
      setTimeout(() => {
        dispatch(
          pushNotification({
            type: 'success',
            title: 'Transaction Confirmed',
            content:
              'Your approval has been confirmed. You may now purchase POP.',
            isFlash: true,
            id: new Date().getTime(),
          }),
        )
      }, 500)
      contracts.USDC.removeAllListeners();
    })
      .connect(library.getSigner())
      .approve(
        contracts.privateSale.address,
        parseFixed(purchaseAmountUSDC.toString(), 6),
      )
      .then(() => {
        setIsTxPending(true);
        dispatch(
          pushNotification({
            type: 'waiting',
            title: 'Transaction Submitted',
            content:
              'Your approval has been submitted. Now awaiting confirmation.',
            id: id,
          }),
        );
      })
      .catch(handleError);
  };

  const purchasePop = () => {
    const id = new Date().getTime();
    setIsTxPending(true);
    contracts.privateSale
      .on('TokensPurchased', (participant, amount) => {
        setIsTxPending(false);
        //handle purchase completion
        dispatch(hideNotification(id));
        dispatch(clearNotifications());
        dispatch(
          setSingleActionModal({
            title: 'Congratulations',
            type: 'info',
            content: `You have successfully purchased ${formatter.format(
              popToPurchase,
            )} POP! We're excited to have you join us!`,
            onConfirm: {
              label: `Let's change the world!`,
              onClick: () =>
                dispatch(
                  setSingleActionModal({
                    title: "Let's go!",
                    type: 'info',
                    content: (
                      <iframe
                        width="280"
                        height="158"
                        style={{ margin: '0 auto', display: 'block' }}
                        src="https://www.youtube.com/embed/3GwjfUFyY6M?start=20"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ),
                    onConfirm: {
                      label: 'Close',
                      onClick: () => dispatch(setSingleActionModal(false)),
                    },
                  }),
                ),
            },
          }),
        );
        contracts.privateSale.removeAllListeners();
      })
      .connect(library.getSigner())
      .purchase(parseFixed(purchaseAmountUSDC.toString(), 6))
      .then(() => {
        setIsTxPending(true);
        dispatch(
          pushNotification({
            type: 'waiting',
            title: 'Transaction Submitted',
            content:
              'Your POP purchase transaction has been submitted. Now awaiting confirmation.',
            id: id,
          }),
        );
      })
      .catch(handleError);
  };

  const getPrivateSaleParticipants = () => {
    setIsTxPending(true);
    contracts.privateSale.participants(account).then((res) => {
      setIsParticipant(res);
      setIsTxPending(false);
    });
  };

  const getUSDCBalance = () => {
    contracts.USDC.balanceOf(account).then((balance) =>
      setUsdcBalance(parseInt(formatFixed(balance, 6))),
    );
  };

  const getUSDCAllowance = () => {
    contracts.USDC.allowance(
      account,
      contracts.privateSale.address,
    ).then((approved) => setAllowance(parseInt(formatFixed(approved, 6))));
  };

  useEffect(() => {
    if (account && contracts) {
      getPrivateSaleParticipants();
      getUSDCBalance();
      getUSDCAllowance();
    }
  }, [account, contracts]);

  const onChangePurchaseAmount = (event) => {
    setPurchaseAmount(+event.target.value);
    setPopToPurchase(Number(event.target.value) / 0.15);
  };

  useEffect(() => {
    if (!account) {
      dispatch(
        setSingleActionModal({
          content: 'To purchase POP, you must connect your Metamask wallet.',
          title: 'Connect',
          onConfirm: {
            label: 'Connect Wallet to Continue',
            onClick: () => {
              dispatch(setSingleActionModal(false));
              activate(connectors.Injected);
            },
          },
          type: 'info',
        }),
      );
    }
  }, []);

  return (
    <div className="w-full bg-gray-900 h-screen">
      <NavBar />

      <div className="bg-gray-900">
        {account && isParticipant && (
          <div className="pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
            <div className="text-center">
              <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
              <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl pb-8">
                Purchase POP
              </p>
              <div className="w-full border-t border-gray-100 border-opacity-10 pt-8"></div>
              <p className="mt-3 max-w-4xl mx-auto text-l font-light text-gray-300 sm:mt-5 sm:text-2xl">
                Your contribution today will plant the seed for social and
                environmental impact that will last a lifetime. We're excited to
                have you join this journey.
              </p>
            </div>
          </div>
        )}

        {account && !isTxPending && !isParticipant && (
          <div className="mt-2 pb-0 lg:mt-4 lg:pb-0">
            <div className="relative z-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative lg:grid lg:grid-cols-7">
                  <div className="max-w-lg mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-start-3 lg:col-end-6 lg:row-start-1 lg:row-end-4">
                    <div className="relative z-10 rounded-lg shadow-xl">
                      <div className="border-t-2 rounded-t-lg border-gray-100 rounded-b-lg  bg-gray-100  sm:px-10 sm:py-1 font-extralight">
                        <h3
                          className="text-center text-xl font-extralight text-gray-900 sm:-mx-6"
                          id="tier-growth"
                        >
                          This address is not permitted to purchase POP.
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {account && isParticipant && (
          <div className="mt-8 pb-12 lg:mt-8 lg:pb-20">
            <div className="relative z-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative lg:grid lg:grid-cols-7">
                  <div className="mt-10 max-w-lg mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-start-3 lg:col-end-6 lg:row-start-1 lg:row-end-4">
                    <div className="relative z-10 rounded-lg shadow-xl">
                      <div className="bg-white rounded-t-lg px-6 pt-8 pb-10">
                        <div className="flex flex-col">
                          <span className="flex flex-row justify-between mb-8">
                            <p className="text-gray-600">Your USDC Balance</p>
                            <span className="text-gray-600 flex flex-row">
                              <p className="">
                                {formatter.format(usdcBalance)}
                              </p>
                            </span>
                          </span>
                          <h3
                            className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                            id="tier-growth"
                          >
                            POP Tokens to Purchase
                          </h3>
                          <p className="px-3 text-center my-4 text-6xl font-black tracking-tight text-gray-900 sm:text-6xl">
                            {formatter.format(popToPurchase)}
                          </p>
                          <div className="w-10/12 mx-auto pt-8">
                            <div className="w-full">
                              <div>
                                <label
                                  htmlFor="amount"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Enter Purchase Amount in USDC
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                  <input
                                    type="text"
                                    name="amount"
                                    onChange={onChangePurchaseAmount}
                                    id="amount"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                    aria-describedby="price-currency"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span
                                      className="text-gray-500 sm:text-sm"
                                      id="price-currency"
                                    >
                                      USDC
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-2 border-gray-100 rounded-b-lg pt-10 pb-8 px-6 bg-gray-50 space-y-4 sm:px-10 sm:py-10">
                        <p className="text-sm text-gray-500"></p>
                        <div className="rounded-lg shadow-md">
                          {!account && (
                            <MainActionButton
                              label={'Connect Wallet'}
                              handleClick={() => {
                                activate(connectors.Injected);
                              }}
                            />
                          )}
                          {account && allowance >= purchaseAmountUSDC && (
                            <MainActionButton
                              label={`Purchase POP`}
                              handleClick={() => {
                                purchasePop();
                              }}
                              disabled={isTxPending}
                            />
                          )}
                          {account && allowance < purchaseAmountUSDC && (
                            <MainActionButton
                              label={`Approve ${
                                (purchaseAmountUSDC &&
                                  formatter.format(purchaseAmountUSDC)) ||
                                ''
                              } USDC`}
                              handleClick={() => approvePurchase()}
                              disabled={isTxPending || purchaseAmountUSDC == 0}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
