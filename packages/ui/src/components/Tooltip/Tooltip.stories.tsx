import { Story } from '@storybook/react/types-6-0';
import Tooltip from './Tooltip';

export default {
  title: 'Tooltip',
  component: Tooltip,
};

const Template: Story = (args) => (
  <Tooltip id="tooltip" direction="top" title="Title" text="Lorem Ipsum" />
);

export const Primary = Template.bind({});
Primary.args = {
  id: 'tooltip',
  direction: 'top',
  title: 'Title',
  text: 'Lorem Ipsum',
};
