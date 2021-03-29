import { Check, Lock } from 'react-feather';

export interface IGrantRound {
  name: string;
  id: string;
  active: boolean;
  year: number;
}

interface IGrantRoundLink {
  grantRound: IGrantRound;
  scrollToGrantRound: (grantId: string) => void;
}

export default function GrantRoundLink({
  grantRound,
  scrollToGrantRound,
}: IGrantRoundLink): JSX.Element {
  return (
    <li
      id={`${grantRound.id}-GrantLink`}
      className="flex flex-row items-center cursor-pointer"
      onClick={() => scrollToGrantRound(grantRound.id)}
    >
      <div className="h-5 w-5 mr-2 rounded-full border border-white flex items-center justify-center flex-shrink-0">
        {grantRound.active ? (
          <Check size={14} className="text-white" />
        ) : (
          <Lock size={10} className="text-white" />
        )}
      </div>
      <p className="text-white text-base">{grantRound.name}</p>
    </li>
  );
}
