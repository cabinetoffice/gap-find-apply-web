import {
  Button,
  ButtonTypePropertyEnum,
  Details,
  FlexibleQuestionPageLayout,
  TextInput,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationFundingAmountPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  backButtonUrl,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <>
        <Meta
          title={`${
            fieldErrors.length > 0 ? 'Error: ' : ''
          }Funding amount - Apply for a grant`}
        />

        <Layout backBtnUrl={backButtonUrl}>
          <FlexibleQuestionPageLayout
            formAction={formAction}
            fieldErrors={fieldErrors}
            csrfToken={csrfToken}
          >
            <div className="govuk-grid-column-two-thirds">
              <TextInput
                questionTitle="How much funding are you applying for?"
                questionHintText="Please enter whole pounds only"
                fieldName="fundingAmount"
                defaultValue={defaultFields.fundingAmount}
                fieldErrors={fieldErrors}
                width="30"
                textInputSubtype="numeric"
              />

              <Details
                title="Why do we need this information?"
                text="It helps us to understand demand for this grant. Also, we may use this information in future when running anti-fraud checks."
              />

              <Button
                text="Save and continue"
                type={ButtonTypePropertyEnum.Submit}
              />
            </div>
          </FlexibleQuestionPageLayout>
        </Layout>
      </>
    </>
  );
}
