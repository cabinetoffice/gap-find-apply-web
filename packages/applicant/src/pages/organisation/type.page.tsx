import { Details, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { SaveAndCancel } from '../../components/save-and-cancel/SaveAndCancel';
import InferProps from '../../types/InferProps';
import { routes } from '../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };

export default function OrganisationType({
  organisationId,
  csrfToken,
  formAction,
  fieldErrors,
  defaultFields,
}: InferProps<typeof getServerSideProps>) {
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
          <Radio
            questionTitle="What is your organisation type? (optional)"
            questionHintText={
              <>
                <Details
                  title="Why do we need this information?"
                  text="It helps us to identify your organisation. We use this information for due diligence checks and to prevent fraud."
                />
                <p className="govuk-body">Choose one:</p>
              </>
            }
            fieldName="type"
            fieldErrors={fieldErrors}
            radioOptions={[
              { label: 'Limited company', value: 'Limited company' },
              { label: 'Non-limited company', value: 'Non-limited company' },
              { label: 'Registered charity', value: 'Registered charity' },
              { label: 'Unregistered charity', value: 'Unregistered charity' },
              { label: 'Other', value: 'Other' },
            ]}
            defaultChecked={defaultFields.type}
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
}
