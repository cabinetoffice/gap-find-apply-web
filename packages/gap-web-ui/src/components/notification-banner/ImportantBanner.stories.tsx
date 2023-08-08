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

export const successBanner = Template.bind({});
successBanner.args = {
  bannerHeading: 'This is some success banner content',
  isSuccess: true,
};

export const importantBannerWithEmail = Template.bind({});
importantBannerWithEmail.args = {
  bannerHeading: 'This is some important banner content',
  bannerContent: (
    <p className="govuk-body">
      Please get in contact with our support team at{' '}
      <a
        className="govuk-notification-banner__link"
        href="mailto:findagrant@cabinetoffice.gov.uk"
      >
        findagrant@cabinetoffice.gov.uk
      </a>
      {'.'}
    </p>
  ),
};
