import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid';
import { EmissionSummaryStats } from '../TotalStats';

interface StatCardProps {
  item: EmissionSummaryStats;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const StatCard: React.FC<StatCardProps> = ({ item }) => {
  return (
    <div
      key={item.id}
      className="relative h-24 bg-white pt-5 px-6 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
    >
      <dt>
        <div className="absolute bg-indigo-500 rounded-md p-3">
          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      </dt>

      <dt>
        <div className="absolute bg-indigo-500 rounded-md p-3">
          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 text-sm font-medium text-gray-500 truncate">
          {item.name}
        </p>
      </dt>
      <dd className="ml-16  flex items-baseline ">
        <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
        <p
          className={classNames(
            item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
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
            {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
          </span>
          {item.change}
        </p>
      </dd>
    </div>
  );
};
