import React from 'react';
import LineBarChart from './LineBarChart';

export default {
  component: LineBarChart,
  title: 'LineBarChart',
};

const Template = (args) => <LineBarChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  chart: {
    id: '1',
    title: 'Test SimpleLineChart',
    state: 'TASK_INBOX',
    updatedAt: new Date(2021, 0, 1, 9, 0),
  },
};

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
