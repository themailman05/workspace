import React, { useContext } from 'react';
import { store } from 'app/store';
import { setSingleActionModal } from '../app/actions';
import { DummyBeneficiaryProposal } from '../interfaces/beneficiaries';

export default function PhotoSideBar(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  const { dispatch } = useContext(store);
  return (
    <div className="col-span-2 space-y-4">
      <p className="text-2xl text-black sm:text-4xl lg:text-5xl">Photos</p>
      {beneficiaryProposal.photoURLs.map((photoURL) => {
        return (
          <div>
            <img
              src={photoURL}
              onClick={() => {
                dispatch(
                  setSingleActionModal({
                    title: '',
                    content: <img src={photoURL} />,
                    visible: true,
                    onConfirm: {
                      label: 'Close',
                      onClick: () => {
                        dispatch(setSingleActionModal(false));
                      },
                    },
                  }),
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
