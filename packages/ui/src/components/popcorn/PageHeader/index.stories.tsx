// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { PageHeader } from './index';

export default {
  title: 'Popcorn/PageHeader',
  component: PageHeader,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <PageHeader {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
