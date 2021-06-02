import useLocalStorageState from 'use-local-storage-state';

export default function Review({ currentStep }): JSX.Element {
  if (currentStep === 10) {
    return (
      <div>
        <h1>Review</h1>
        <h1>name: {window.localStorage.name}</h1>
        <h1>missionStatement: {window.localStorage.missionStatement}</h1>
        <h1>ethereumAddress: {window.localStorage.ethereumAddress}</h1>
        <h1>proofOfOwnership: {window.localStorage.proofOfOwnership}</h1>
        <h1>profile img hash: {window.localStorage.img}</h1>
        <h1>header img hash: {window.localStorage.headerimg}</h1>
        <h1>additionalimages: {window.localStorage.additionalimages}</h1>
        <h1>impactreports: {window.localStorage.impactreports}</h1>
        <h1>socialMediaLinks: {window.localStorage.socialMediaLinks}</h1>
        <button onClick={() => window.alert('submit') }>Submit</button>
      </div>
    );
  } else {
    return <></>;
  }
}
