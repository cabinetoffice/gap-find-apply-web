import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import { MQ_ORG_TYPES } from '../../../utils/constants';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };

export default function MandatoryQuestionOrganisationAddressPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  backButtonUrl,
  mandatoryQuestion,
}: InferProps<typeof getServerSideProps>) {
  const commonAddressInputProps = {
    boldHeading: false,
    titleSize: 's',
    fieldErrors: fieldErrors,
  } as const;

  let questionTitle;

  switch (mandatoryQuestion.orgType) {
    case MQ_ORG_TYPES.INDIVIDUAL:
      questionTitle = 'Enter your address';
      break;
    case MQ_ORG_TYPES.LOCAL_AUTHORITY:
      questionTitle = 'Enter your local authority address';
      break;
    default:
      questionTitle = "Enter your organisation's address";
  }

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation address - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <h1
            className="govuk-heading-l"
            data-cy="cy-addressInput-question-title"
          >
            {questionTitle}
          </h1>

          <TextInput
            questionTitle="Address line 1"
            fieldName="addressLine1"
            defaultValue={defaultFields.addressLine1}
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="Address line 2 (optional)"
            fieldName="addressLine2"
            defaultValue={defaultFields.addressLine2}
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="Town or City"
            fieldName="city"
            defaultValue={defaultFields.city}
            width="20"
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="County (optional)"
            fieldName="county"
            defaultValue={defaultFields.county}
            width="20"
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="Postcode"
            fieldName="postcode"
            defaultValue={defaultFields.postcode}
            width="10"
            {...commonAddressInputProps}
          />

          <Button
            text="Save and continue"
            type={ButtonTypePropertyEnum.Submit}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
