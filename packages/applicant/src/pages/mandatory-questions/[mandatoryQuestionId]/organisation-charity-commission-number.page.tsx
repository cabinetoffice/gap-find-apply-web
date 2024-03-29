import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationCharityCommissionNumberPage({
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
        }Charity Commission number - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter your Charity Commission number (if you have one)"
            questionHintText={
              <>
                <p>
                  Funding organisation might use this to identify your
                  organisation when you apply for a grant. It might also be used
                  to check your organisation is legitimate.
                </p>
                <a
                  href="https://register-of-charities.charitycommission.gov.uk/charity-search"
                  className="govuk-link govuk-link--no-visited-state"
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cy="cy-search-charity-commission-number"
                >
                  Search for your charity number (opens in new tab)
                </a>
              </>
            }
            fieldName="charityCommissionNumber"
            defaultValue={defaultFields.charityCommissionNumber}
            fieldErrors={fieldErrors}
            width="20"
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
