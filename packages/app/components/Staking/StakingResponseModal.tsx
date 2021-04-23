import Modal from 'components/Modal';
import { useRouter } from 'next/router';
import { Dispatch } from 'react';

interface StakingResponseModalProps {
  title: string;
  text: string;
  handleClick: any;
}

export default function StakingResponseModal({
  title,
  text,
  handleClick,
}: StakingResponseModalProps): JSX.Element {
  return (
    <Modal>
      <div>
        <div className="mt-3 text-center sm:mt-5">
          <h3
            className="text-lg leading-6 font-medium text-gray-900"
            id="modal-title"
          >
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{text}</p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={handleClick}
          >
            Ok
          </button>
        </div>
      </div>
    </Modal>
  );
}
