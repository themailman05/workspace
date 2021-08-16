import { Meta, Story } from '@storybook/react/types-6-0';
import { getDummyEmissionData } from '../dummyEmissionsData';
import LineBarChart from './index';

export default {
  title: 'Popcorn/Charts/LineBarChart',
  component: LineBarChart,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <LineBarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = { data: getDummyEmissionData(), width: 300, height: 200 };
