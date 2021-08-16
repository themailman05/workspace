import { Meta, Story } from '@storybook/react/types-6-0';
import { getDummyEmissionData } from '../dummyEmissionsData';
import { EmissionsLineBarChart } from './index';

export default {
  title: 'Popcorn/Charts/EmissionsLineBarChart',
  component: EmissionsLineBarChart,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <EmissionsLineBarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = { data: getDummyEmissionData(), width: 300, height: 200 };
