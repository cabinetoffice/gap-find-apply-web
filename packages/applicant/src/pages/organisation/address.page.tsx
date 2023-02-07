import { FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { SaveAndCancel } from '../../components/save-and-cancel/SaveAndCancel';
import InferProps from '../../types/InferProps';
import { routes } from '../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };

const OrganisationAddress = ({
  csrfToken,
  formAction,
  fieldErrors,
  defaultFields,
  organisationId,
}: InferProps<typeof getServerSideProps>) => {
  const commonAddressInputProps = {
    boldHeading: false,
    titleSize: 's',
    fieldErrors: fieldErrors,
  } as const;

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation details - Apply for a grant`}
      />

      <Layout backBtnUrl={routes.organisation.index}>
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <h1
            className="govuk-heading-l"
            data-cy="cy-addressInput-question-title"
          >
            Enter the address of your organisation (optional)
          </h1>

          <TextInput
            questionTitle="Address line 1"
            fieldName="addressLine1"
            defaultValue={defaultFields.addressLine1}
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="Address line 2"
            fieldName="addressLine2"
            defaultValue={defaultFields.addressLine2}
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="Town or City"
            fieldName="town"
            defaultValue={defaultFields.town}
            width="20"
            {...commonAddressInputProps}
          />

          <TextInput
            questionTitle="County"
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

          <input type="hidden" value={organisationId} name="id" />

          <SaveAndCancel
            type={ButtonTypePropertyEnum.Submit}
            saveButton={{ name: 'Save' }}
            cancelLink={{
              url: routes.organisation.index,
              text: 'Cancel',
              noVisitedState: true,
            }}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
};

export default OrganisationAddress;
