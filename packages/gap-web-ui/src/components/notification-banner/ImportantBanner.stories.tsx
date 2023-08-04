import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import ImportantBanner from './ImportantBanner';

export default {
  title: 'gap-web-ui/ImportantBanner',
  component: ImportantBanner,
} as ComponentMeta<typeof ImportantBanner>;

const Template: ComponentStory<typeof ImportantBanner> = (args) => (
  <ImportantBanner {...args} />
);

export const importantBanner = Template.bind({});

importantBanner.args = {
  bannerHeading: 'This is some important banner content',
};
