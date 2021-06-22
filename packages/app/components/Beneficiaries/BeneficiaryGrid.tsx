import CardGridHeader from 'components/CardGridHeader';
import Navbar from 'components/NavBar/NavBar';
import { Beneficiary } from 'interfaces/beneficiaries';
import React, { useState } from 'react';
import * as Icon from 'react-feather';
import BeneficiaryCard from './BeneficiaryCard';

interface BeneficiaryGridProps {
  title: string;
  subtitle: string;
  cardProps: Beneficiary[];
}

export default function BeneficiaryGrid({
  title,
  subtitle,
  cardProps,
}: BeneficiaryGridProps) {
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <div className="w-full bg-gray-900 pb-16">
      <Navbar />
      <CardGridHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-4 items-center justify-start ml-36 mr-64 my-4 h-1/2">
        <div className="relative text-gray-600 focus-within:text-gray-400 ">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Icon.Search className="mr-4" />
          </span>
          <div className="mt-1 ">
            <input
              type="search"
              name="searchfilter"
              className="py-2 w-full text-xl text-black bg-white rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
              placeholder={'Search ' + title}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      <ul className="sm:grid sm:grid-cols-2 gap-x-2 gap-y-12 lg:grid-cols-3 mx-36">
        {cardProps
          ?.filter((cardProp) => {
            return cardProp?.name
              .toLowerCase()
              .includes(searchFilter.toLowerCase());
          })
          .map((cardProp) => (
            <BeneficiaryCard
              key={cardProp?.ethereumAddress}
              beneficiary={cardProp}
            />
          ))}
      </ul>
    </div>
  );
}
