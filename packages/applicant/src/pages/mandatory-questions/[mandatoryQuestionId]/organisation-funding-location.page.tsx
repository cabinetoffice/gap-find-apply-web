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
  fieldErrors = [],
  formAction,
  defaultFields,
  backButtonUrl,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <>
        <Meta
          title={`${
            (fieldErrors || []).length > 0 ? 'Error: ' : ''
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
                { label: 'North East (England)', value: 'North East (England)' },
                { label: 'North West (England)', value: 'North West (England)' },
                { label: 'Yorkshire and the Humber', value: 'Yorkshire and the Humber' },
                { label: 'East Midlands (England)', value: 'East Midlands (England)' },
                { label: 'West Midlands (England)', value: 'West Midlands (England)' },
                { label: 'East (England)', value: 'East (England)' },
                { label: 'London', value: 'London' },
                { label: 'South East (England)', value: 'South East (England)' },
                { label: 'South West (England)', value: 'South West (England)' },
                { label: 'Scotland', value: 'Scotland' },
                { label: 'Wales', value: 'Wales' },
                { label: 'Northern Ireland', value: 'Northern Ireland' },
                { label: 'International', value: 'Outside of the UK' },
              ]}
              defaultCheckboxes={defaultFields.fundingLocation}
              fieldErrors={fieldErrors}
              newLineAccepted={true}
              useOptionValueAsInputValue={true}
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
