export default function ProfileImage({ currentStep }): JSX.Element {
  if (currentStep === 5) {
    return (
      <div>
        <h1>PI</h1>
      </div>
    );
  } else {
    return <></>;
  }
}
