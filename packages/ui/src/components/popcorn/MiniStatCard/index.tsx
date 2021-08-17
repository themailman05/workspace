import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid';
import { EmissionSummaryStats } from '../TotalStats';

interface MiniStatCardProps {
  item: EmissionSummaryStats;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({ item }) => {
  return (
    <div
      key={item.id}
      className="relative h-18 bg-white pt-2 px-3 pb-3 sm:pt-3 sm:px-3 shadow rounded-lg overflow-hidden"
    >
      <dt>
        <div className="absolute bg-indigo-500 rounded-md p-1 mt-3">
          <item.icon className="h-3 w-3 text-white" aria-hidden="true" />
        </div>
        <p className="ml-8 text-sm font-medium text-gray-500 truncate">
          {item.name}
        </p>
      </dt>
      <dd className="ml-8 flex items-baseline ">
        <p className="text-l font-semibold text-gray-900">{item.stat}</p>
        <p
          className={classNames(
            item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
            'ml-1 flex items-baseline text-sm font-semibold',
          )}
        >
          {item.changeType === 'increase' ? (
            <ArrowSmUpIcon
              className="self-center y-auto flex-shrink-0 h-3 w-3 text-green-500"
              aria-hidden="true"
            />
          ) : (
            <ArrowSmDownIcon
              className="self-center y-auto flex-shrink-0 h-3 w-3 text-red-500"
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
