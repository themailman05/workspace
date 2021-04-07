import GrantFunded from './GrantFunded';
import VoteSlider from './VoteSlider';
import Link from 'next/link';
import { IVote } from 'pages/grants';

interface Beneficiary {
  address: string,
  title: string,
  description: string,
  image: string,
  totalVotes: number;
}
interface IBeneficiaryCard {
  beneficiary: Beneficiary;
  grantTerm: number;
  active: boolean;
  votesAssignedByUser?: number;
  assignVotes?: (grantTerm: number, vote: IVote) => void;
  maxVotes?: number;
  quadratic: boolean;
}

export default function BeneficiaryCard({
  beneficiary,
  active,
  grantTerm,
  votesAssignedByUser,
  assignVotes,
  maxVotes,
  quadratic,
}: IBeneficiaryCard): JSX.Element {
  return (
    <div
      className="shadow-sm w-80 h-100 rounded-lg mr-6 mb-6 bg-gray-200"

    >


      <Link href={`beneficiary/${beneficiary?.address}`} passHref>
        <a>
          <div className="w-full h-32 rounded-t-lg">
            {beneficiary?.image && (
            <img className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto" src={beneficiary?.image} alt="" style={{objectFit: 'cover', height: '120px' }}  ></img>)}
          </div>
        </a>
      </Link>
      <div className="w-full px-4 pb-3">
        <div className="h-10 mt-3">
          <Link href={`beneficiary/${beneficiary?.address}`} passHref>
            <a>
              <h3 className="text-lg font-bold text-gray-800 leading-snug">
                {beneficiary?.title}
              </h3>
            </a>
          </Link>
        </div>
        <div className="h-32">
          <Link href={`beneficiary/${beneficiary?.address}`} passHref>
            <a>
              <p className="text-sm text-gray-700">{beneficiary?.description}</p>
            </a>
          </Link>
        </div>
        <div className="">
          {active ? (
            <VoteSlider
              address={beneficiary?.address}
              totalVotes={beneficiary?.totalVotes}
              votesAssignedByUser={votesAssignedByUser}
              assignVotes={assignVotes}
              maxVotes={maxVotes}
              grantTerm={grantTerm}
              quadratic={quadratic}
            />
          ) : (
            <GrantFunded votes={beneficiary?.totalVotes} />
          )}
        </div>
      </div>
    </div>
  );
}
