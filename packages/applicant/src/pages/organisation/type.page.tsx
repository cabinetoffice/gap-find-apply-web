import { Details, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { SaveAndCancel } from '../../components/save-and-cancel/SaveAndCancel';
import InferProps from '../../types/InferProps';
import { routes } from '../../utils/routes';
import getServerSideProps from './getServerSideProps';
import { MQ_ORG_TYPES } from '../../utils/constants';

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
            questionHintText="Choose the option that best describes you or your organisation"
            fieldName="type"
            fieldErrors={fieldErrors}
            radioOptions={[
              {
                label: MQ_ORG_TYPES.LIMITED_COMPANY,
                value: MQ_ORG_TYPES.LIMITED_COMPANY,
              },
              {
                label: MQ_ORG_TYPES.NON_LIMITED_COMPANY,
                value: MQ_ORG_TYPES.NON_LIMITED_COMPANY,
              },
              { label: MQ_ORG_TYPES.CHARITY, value: MQ_ORG_TYPES.CHARITY },
              {
                label: MQ_ORG_TYPES.INDIVIDUAL,
                value: MQ_ORG_TYPES.INDIVIDUAL,
              },
              { label: MQ_ORG_TYPES.OTHER, value: MQ_ORG_TYPES.OTHER },
            ]}
            defaultChecked={defaultFields.type}
          />
          <Details
            title="Why do we need this information?"
            text="It helps us to identify you or your organisation. We use this information for due diligence checks and to prevent fraud."
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
