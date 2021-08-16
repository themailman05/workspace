import {
  CloudIcon,
  CursorClickIcon,
  TrendingUpIcon,
} from '@heroicons/react/outline';
import { Meta, Story } from '@storybook/react/types-6-0';
import { AddContractButton } from '../../../AddContractButton';
import { ContractStats } from '../../../ContractStats';
import { Divider } from '../../../Divider';
import { PageHeader } from '../../../PageHeader';
import { TotalStats } from '../../../TotalStats';

const EmissionsDashboardPage = () => {
  return (
    <div className="bg-gray-50">
      <PageHeader />
      <TotalStats
        emissionSummaryStats={[
          {
            id: 1,
            name: 'co2Emissions',
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
        ]}
      />
      <Divider />
      <ContractStats />
      <ContractStats />
      <ContractStats />
      <ContractStats />
      <AddContractButton />
    </div>
  );
};

export default {
  title: 'Emissions Dashboard / Dashboard',
  component: EmissionsDashboardPage,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <EmissionsDashboard {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
