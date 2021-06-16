interface MissionStatement {
  missionStatement: string;
}

export default function MissionStatement({
  missionStatement,
}: MissionStatement): JSX.Element {
  return (
    <div className="col-span-6 space-y-4">
      <p className="text-3xl text-black sm:text-4xl lg:text-5xl">
        Mission Statement
      </p>
      <p className="max-w-4xl text-xl text-black sm:text-2xl">
        {missionStatement}
      </p>
    </div>
  );
}
