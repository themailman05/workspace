import React, { useContext } from 'react';
import { store } from '../context/store';
import { DummyBeneficiaryProposal } from '../interfaces/beneficiaries';

export default function PhotoSideBar(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  const { dispatch } = useContext(store);
  return (
    <div className="col-span-2 space-y-4">
      <p className="text-2xl text-black sm:text-4xl lg:text-5xl">Photos</p>
      {beneficiaryProposal.additionalImages.map((photoURL) => {
        return (
          <img
            className="w-full"
            src={`${process.env.IPFS_URL}${photoURL}`}
            alt=""
          />
        );
      })}
    </div>
  );
}
