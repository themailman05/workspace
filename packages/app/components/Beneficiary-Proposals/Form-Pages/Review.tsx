export default function Review({ currentStep }):JSX.Element {
  if (currentStep === 10) {
    return (
      <div>
        <h1>Review</h1>
      </div>
    );
  } else {
    return <></>;
  }
}