import { CheckIcon, XIcon } from '@heroicons/react/solid';
import { DocumentReportIcon } from '@heroicons/react/outline';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';

interface DProps {
  localStorageFile: string | string[];
  setLocalStorage: UpdateState<string> | UpdateState<string[]>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
}

function ActionButtons({
  setLocalStorage,
  setCurrentStep,
  currentStep,
}): JSX.Element {
  return (
    <div className="row-auto my-2 justify-self-center">
      <button
        onClick={() => setLocalStorage([])}
        className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Remove
        <XIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
      </button>
      <button
        onClick={() => setCurrentStep(currentStep++)}
        className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        OK
        <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export const DisplayImages: React.FC<DProps> = ({
  localStorageFile,
  setLocalStorage,
  setCurrentStep,
  currentStep,
}): JSX.Element => {
  return (
    <div className="grid justify-items-stretch">
      <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
        Image Preview
      </p>
      {Array.isArray(localStorageFile) ? (
        <div className="my-4 grid grid-cols-4 gap-8 mx-16">
          {localStorageFile.map((imgHash) => {
            return (
              <div key={imgHash}>
                <img src={'https://gateway.pinata.cloud/ipfs/' + imgHash}></img>
              </div>
            );
          })}
        </div>
      ) : (
        <img
          className="w-1/4 justify-self-center"
          src={'https://gateway.pinata.cloud/ipfs/' + localStorageFile}
        ></img>
      )}
      <ActionButtons
        setLocalStorage={setLocalStorage}
        setCurrentStep={setCurrentStep}
        currentStep={currentStep}
      />
    </div>
  );
};

export const DisplayPDFs: React.FC<DProps> = ({
  localStorageFile,
  setLocalStorage,
  setCurrentStep,
  currentStep,
}): JSX.Element => {
  return (
    <div className="grid justify-items-stretch">
      <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
        {localStorageFile.length ? 'Document Preview' : ''}
      </p>
      {Array.isArray(localStorageFile) ? (
        <div>
          {localStorageFile.map((IpfsHash, i) => {
            return (
              <div key={IpfsHash} className="row-auto justify-self-center">
                <a
                  className="mx-2 justify-self-center mt-4 inline-flex px-4 py-1"
                  href={'https://gateway.pinata.cloud/ipfs/' + IpfsHash}
                >
                  {'Impact Report/Audit ' + i + ': '}
                  <DocumentReportIcon className="ml-2 h-5 w-5" />
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div></div>
      )}
      <ActionButtons
        setLocalStorage={setLocalStorage}
        setCurrentStep={setCurrentStep}
        currentStep={currentStep}
      />
    </div>
  );
};
