import { FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { SaveAndCancel } from '../../components/save-and-cancel/SaveAndCancel';
import { routes } from '../../utils/routes';
import InferProps from '../../types/InferProps';
import getServerSideProps from './getServerSideProps';
import { MQ_ORG_TYPES } from '../../utils/constants';

export { getServerSideProps };

export default function OrganisationName({
  organisationType,
  organisationId,
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
}: InferProps<typeof getServerSideProps>) {
  const isIndividual = organisationType === MQ_ORG_TYPES.INDIVIDUAL;

  const questionTitle = isIndividual
    ? 'Enter your full name (Optional)'
    : 'Enter the name of your organisation (Optional)';

  const questionHintText = isIndividual
    ? 'Your name will appear on your application.'
    : 'Enter the official name of your organisation. It could be the name that is registered with Companies House or the Charity Commission.';

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation details - Apply for a grant`}
      />

      <Layout backBtnUrl={routes.organisation.index}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle={questionTitle}
            questionHintText={questionHintText}
            fieldName="legalName"
            defaultValue={defaultFields.legalName}
            fieldErrors={fieldErrors}
            width="30"
          />

          <input type="hidden" value={organisationId} name="id" />

          <SaveAndCancel
            type={ButtonTypePropertyEnum.Submit}
            saveButton={{
              name: 'Save',
            }}
            cancelLink={{
              text: 'Cancel',
              url: routes.organisation.index,
              noVisitedState: true,
            }}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
