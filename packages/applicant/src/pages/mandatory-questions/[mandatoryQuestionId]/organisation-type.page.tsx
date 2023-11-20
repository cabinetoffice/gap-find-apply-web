import { Button, Details, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationTypePage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  backButtonUrl,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation type - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <Radio
            questionTitle="Choose your application type"
            questionHintText="Choose the option that best describes you or your organisation"
            fieldName="orgType"
            fieldErrors={fieldErrors}
            radioOptions={[
              { label: 'Limited company', value: 'Limited company' },
              { label: 'Non-limited company', value: 'Non-limited company' },
              { label: 'Charity', value: 'Charity' },
              {
                label: 'I am applying as an individual',
                value: 'I am applying as an individual',
              },
              { label: 'Other', value: 'Other' },
            ]}
            defaultChecked={defaultFields.orgType}
          />
          <Details
            title="Why do we need this information?"
            text="It helps us to identify you or your organisation. We use this information for due diligence checks and to prevent fraud."
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
