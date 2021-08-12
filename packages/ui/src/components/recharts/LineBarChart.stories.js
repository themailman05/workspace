import React from 'react';
import LineBarChart from './LineBarChart';

export default {
  component: LineBarChart,
  title: 'LineBarChart',
};

const Template = (args) => <LineBarChart {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Pinned = Template.bind({});
Pinned.args = {
  chart: {
    ...Default.args.chart,
    state: 'TASK_PINNED',
  },
};

export const Archived = Template.bind({});
Archived.args = {
  chart: {
    ...Default.args.chart,
    state: 'TASK_ARCHIVED',
  },
};
