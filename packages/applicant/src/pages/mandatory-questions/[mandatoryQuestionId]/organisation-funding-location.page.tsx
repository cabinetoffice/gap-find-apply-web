import {
  Button,
  ButtonTypePropertyEnum,
  Checkboxes,
  FlexibleQuestionPageLayout,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationFundingLocationPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl =
    routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId) +
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
            <Checkboxes
              questionTitle="Where will this funding be spent?"
              questionHintText={
                <>
                  Select the location where the grant funding will be spent. You
                  can choose more than one, if it is being spent in more than
                  one location.{'\n'}
                  {'\n'}Select all that apply:
                </>
              }
              fieldName="fundingLocation"
              options={[
                'North East England',
                'North West England',
                'Yorkshire and The Humber',
                'East Midlands (England)',
                'West Midlands',
                'East England',
                'London',
                'South East England',
                'South West England',
                'Midlands',
                'Scotland',
                'Wales',
                'Northern Ireland',
                'Outside UK',
              ]}
              defaultCheckboxes={defaultFields.fundingLocation}
              fieldErrors={fieldErrors}
              newLineAccepted={true}
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
