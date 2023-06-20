import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import FlexibleQuestionPageLayout from './FlexibleQuestionPageLayout';
import { checkboxesWithDescription as Checkboxes } from './inputs/Checkboxes.stories';
import { DateInputWithDescription as DateInput } from './inputs/DateInput.stories';
import { WithDescription as Radio } from './inputs/Radio.stories';
import { SelectWithDefaultValue as SelectInput } from './inputs/SelectInput.stories';
import { WithDescription as TextArea } from './inputs/TextArea.stories';
import { WithDescription as TextInput } from './inputs/TextInput.stories';
import { WithDescription as RichText } from './inputs/RichText.stories';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const childrenComponents: { [key: string]: ComponentStory<any> } = {
  TextInput,
  TextArea,
  DateInput,
  SelectInput,
  Checkboxes,
  Radio,
  RichText,
};

export default {
  title: 'gap-web-ui/FlexibleQuestionPageLayout',
  component: FlexibleQuestionPageLayout,
  argTypes: {
    children: {
      options: Object.keys(childrenComponents),
      control: 'check',
    },
  },
} as ComponentMeta<typeof FlexibleQuestionPageLayout>;

const Template: ComponentStory<typeof FlexibleQuestionPageLayout> = (args) => {
  const childrenKeys = args.children as string[];
  let children = [<p key="default">Please pick children you want to render</p>];

  if (childrenKeys) {
    children = childrenKeys.map((childKey, index: number) => {
      const ChildElement = childrenComponents[childKey];

      return <ChildElement key={index} {...ChildElement.args} />;
    });
  }

  return (
    <FlexibleQuestionPageLayout {...args}>
      {children}
    </FlexibleQuestionPageLayout>
  );
};
export const WithVariableChildren = Template.bind({});
WithVariableChildren.args = {
  children: '',
  pageCaption: 'Construction grant application form',
  formAction: '/',
  fieldErrors: [],
};
