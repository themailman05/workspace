import {
  CloudIcon,
  CursorClickIcon,
  TrendingUpIcon,
} from '@heroicons/react/outline';
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid';
import AreaChart from '../../../recharts/AreaChart/AreaChart';
import { getDummyEmissionData } from '../../../recharts/dummyEmissionsData';

const stats = [
  {
    id: 1,
    name: 'CO2 Emissions',
    stat: '71kg',
    icon: CloudIcon,
    change: '12.38%',
    changeType: 'increase',
  },
  {
    id: 2,
    name: 'Transactions',
    stat: '23',
    icon: TrendingUpIcon,
    change: '5.4%',
    changeType: 'increase',
  },
  {
    id: 3,
    name: 'Average Gas Price',
    stat: '45',
    icon: CursorClickIcon,
    change: '3.2%',
    changeType: 'decrease',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TotalStats1() {
  return (
    <div className="pb-8 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mt-16">
        Totals between 12/04/2021 and 30/05/2021
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mx-4">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative h-24 bg-white pt-5 px-6 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden "
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16  flex items-baseline ">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={classNames(
                  item.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold',
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowSmUpIcon
                    className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowSmDownIcon
                    className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only">
                  {item.changeType === 'increase' ? 'Increased' : 'Decreased'}{' '}
                  by
                </span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
        <AreaChart data={getDummyEmissionData()} width={300} height={200} />
      </dl>
    </div>
  );
}
