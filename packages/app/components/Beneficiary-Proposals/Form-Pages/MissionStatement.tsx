export default function MissionStatement({ currentStep }):JSX.Element {

    if (currentStep === 3) {
      return (
        <div>
          <h1>MS</h1>
        </div>
      );
    } else {
      return <></>;
    }

}