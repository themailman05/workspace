export default function AdditionalImages({ currentStep }):JSX.Element {
  if (currentStep === 7) {
    return (
      <div>
        <h1>Additional Images</h1>
      </div>
    );
  } else {
    return <></>;
  }
}