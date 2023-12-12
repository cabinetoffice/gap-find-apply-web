import {
  Button,
  ButtonTypePropertyEnum,
  Checkboxes,
  FlexibleQuestionPageLayout,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationFundingLocationPage({
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
                'North East (England)',
                'North West (England)',
                'Yorkshire and the Humber',
                'East Midlands (England)',
                'West Midlands (England)',
                'East (England)',
                'London',
                'South East (England)',
                'South West (England)',
                'Scotland',
                'Wales',
                'Northern Ireland',
                'Outside of the UK',
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
