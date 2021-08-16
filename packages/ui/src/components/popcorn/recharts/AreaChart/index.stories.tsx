import { Meta, Story } from '@storybook/react/types-6-0';
import { getDummyEmissionData } from '../dummyEmissionsData';
import { EmissionsAreaChart } from './index';

export default {
  title: 'Popcorn/Charts/AreaChart',
  component: EmissionsAreaChart,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <EmissionsAreaChart {...args} />;

export const Primary = Template.bind({});
Primary.args = { data: getDummyEmissionData(), width: 300, height: 200 };
