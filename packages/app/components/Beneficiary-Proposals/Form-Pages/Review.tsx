import useLocalStorageState from 'use-local-storage-state';

export default function Review({ currentStep }): JSX.Element {

  if (currentStep === 10) {
    return (
      <div>
        <h1>Review</h1>
        <h1>{window.localStorage.name}</h1>
        <h1>{window.localStorage.missionStatement}</h1>
        <h1>{window.localStorage.ethereumAddress}</h1>
      </div>
    );
  } else {
    return <></>;
  }
}
