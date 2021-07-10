interface MissionStatement {
  missionStatement: string;
}

export default function MissionStatement({
  missionStatement,
}: MissionStatement): JSX.Element {
  return (
    <div className="col-span-6 space-y-4">
      <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Mission Statement
      </h3>
      <p className="mt-8 text-lg text-gray-500">{missionStatement}</p>
    </div>
  );
}
