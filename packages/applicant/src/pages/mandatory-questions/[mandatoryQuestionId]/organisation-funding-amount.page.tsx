import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import Meta from '../../../components/partials/Meta';
import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
} from 'gap-web-ui';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationFundingAmountPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl =
    routes.mandatoryQuestions.charityCommissionNumberPage(mandatoryQuestionId) +
    '?fromSummaryPage=true';
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
            <TextInput
              questionTitle="How much funding are you applying for?"
              questionHintText="Please enter whole pounds only"
              fieldName="fundingAmount"
              defaultValue={defaultFields.fundingAmount}
              fieldErrors={fieldErrors}
              width="30"
              textInputSubtype="numeric"
            />

            <Button
              text="Save and continue"
              type={ButtonTypePropertyEnum.Submit}
            />
          </FlexibleQuestionPageLayout>
        </Layout>
      </>
    </>
  );
}
