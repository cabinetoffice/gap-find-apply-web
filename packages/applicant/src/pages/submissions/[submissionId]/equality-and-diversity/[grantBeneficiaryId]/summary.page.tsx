import { SummaryList } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../../models/GrantBeneficiary';
import { getGrantBeneficiary } from '../../../../../services/GrantBeneficiaryService';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import { errorPageRedirect } from '../equality-and-diversity-service-errors';
import { AgeCheckboxes } from './age.page';
import { EthnicityCheckboxes } from './ethnicity.page';
import { SexRadioOptions } from './sex.page';
import { SexualOrientationCheckboxes } from './sexual-orientation.page';
import { mapValuesToString } from './summaryPageHelper';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { submissionId, grantBeneficiaryId } = params as Record<string, string>;

  let response: GrantBeneficiary;
  try {
    response = await getGrantBeneficiary(submissionId, getJwtFromCookies(req));
  } catch (err) {
    return errorPageRedirect(submissionId);
  }

  const { publicRuntimeConfig } = getConfig();

  return {
    props: {
      grantBeneficiary: response,
      backButtonLink: `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/sexual-orientation`,
      baseChangeLink: `${publicRuntimeConfig.subPath}/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}`,
      confirmationLink: `${publicRuntimeConfig.subPath}/submissions/${submissionId}/equality-and-diversity/confirmation`,
    },
  };
};

const SummaryPage = ({
  grantBeneficiary,
  baseChangeLink,
  confirmationLink,
  backButtonLink,
}: SummaryPageProps) => {
  return (
    <>
      <Meta title="Equality and diversity - Apply for a grant" />
      <Layout backBtnUrl={backButtonLink}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Check your answers:</span>
            <h1 className="govuk-heading-l">
              Equality questions about the grant
            </h1>

            <p className="govuk-body">
              Below is a summary of the information you have given in this
              section. You can go back and change anything you need to.
            </p>

            <SummaryList
              rows={[
                {
                  key: 'Does your organisation primarily focus on supporting a particular sex?',
                  value: grantBeneficiary.sexGroupAll
                    ? SexRadioOptions.ALL
                    : mapValuesToString([
                        grantBeneficiary.sexGroup1 && SexRadioOptions.MALE,
                        grantBeneficiary.sexGroup2 && SexRadioOptions.FEMALE,
                      ]),
                  action: (
                    <a
                      href={`${baseChangeLink}/sex?returnToSummaryPage=yes`}
                      className="govuk-link"
                      aria-label='Change: "Does your organisation primarily focus on supporting a particular sex?"'
                    >
                      Change
                    </a>
                  ),
                },
                {
                  key: 'Does your organisation primarily focus on supporting a particular age group?',
                  value: grantBeneficiary.ageGroupAll
                    ? AgeCheckboxes.ALL
                    : mapValuesToString([
                        grantBeneficiary.ageGroup1 &&
                          AgeCheckboxes.ZERO_TO_FOURTEEN,
                        grantBeneficiary.ageGroup2 &&
                          AgeCheckboxes.FIFTEEN_TO_TWENTY_FOUR,
                        grantBeneficiary.ageGroup3 &&
                          AgeCheckboxes.TWENTY_FIVE_TO_FIFTY_FOUR,
                        grantBeneficiary.ageGroup4 &&
                          AgeCheckboxes.FIFTY_FIVE_TO_SIXTY_FOUR,
                        grantBeneficiary.ageGroup5 &&
                          AgeCheckboxes.SIXTY_FIVE_PLUS,
                      ]),
                  action: (
                    <a
                      href={`${baseChangeLink}/age?returnToSummaryPage=yes`}
                      className="govuk-link"
                      aria-label='Change: "Does your organisation primarily focus on supporting a particular age group?"'
                    >
                      Change
                    </a>
                  ),
                },
                {
                  key: 'Does your organisation primarily focus on supporting a particular ethnic group?',
                  value: grantBeneficiary.ethnicGroupAll
                    ? EthnicityCheckboxes.ALL
                    : mapValuesToString([
                        grantBeneficiary.ethnicGroup1 &&
                          EthnicityCheckboxes.WHITE,
                        grantBeneficiary.ethnicGroup2 &&
                          EthnicityCheckboxes.MIXED,
                        grantBeneficiary.ethnicGroup3 &&
                          EthnicityCheckboxes.ASIAN,
                        grantBeneficiary.ethnicGroup4 &&
                          EthnicityCheckboxes.BLACK,
                        grantBeneficiary.ethnicGroup5 &&
                          EthnicityCheckboxes.ARAB,
                        grantBeneficiary.ethnicGroupOther &&
                          grantBeneficiary.ethnicOtherDetails,
                      ]),
                  action: (
                    <a
                      href={`${baseChangeLink}/ethnicity?returnToSummaryPage=yes`}
                      className="govuk-link"
                      aria-label='Change: "Does your organisation primarily focus on supporting a particular ethnic group?"'
                    >
                      Change
                    </a>
                  ),
                },
                {
                  key: 'Does your organisation primarily focus on supporting people with mental or physical disabilities?',
                  value: mapValuesToString([
                    grantBeneficiary.supportingDisabilities && 'Yes',
                    grantBeneficiary.supportingDisabilities === false && 'No',
                  ]),
                  action: (
                    <a
                      href={`${baseChangeLink}/disability?returnToSummaryPage=yes`}
                      className="govuk-link"
                      aria-label='Change: "Does your organisation primarily focus on supporting people with mental or physical disabilities?"'
                    >
                      Change
                    </a>
                  ),
                },
                {
                  key: 'Does you organisation primarily focus on supporting a particular sexual orientation?',
                  value: grantBeneficiary.sexualOrientationGroupAll
                    ? SexualOrientationCheckboxes.ALL
                    : mapValuesToString([
                        grantBeneficiary.sexualOrientationGroup1 &&
                          SexualOrientationCheckboxes.STRAIGHT,
                        grantBeneficiary.sexualOrientationGroup2 &&
                          SexualOrientationCheckboxes.GAY,
                        grantBeneficiary.sexualOrientationGroup3 &&
                          SexualOrientationCheckboxes.BISEXUAL,
                        grantBeneficiary.sexualOrientationOther &&
                          grantBeneficiary.sexualOrientationOtherDetails,
                      ]),
                  action: (
                    <a
                      href={`${baseChangeLink}/sexual-orientation?returnToSummaryPage=yes`}
                      className="govuk-link"
                      aria-label='Change: "Does you organisation primarily focus on supporting a particular sexual orientation?"'
                    >
                      Change
                    </a>
                  ),
                },
              ]}
            />

            <a
              href={confirmationLink}
              role="button"
              draggable="false"
              className="govuk-button"
              data-module="govuk-button"
            >
              Save and continue
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
};

type SummaryPageProps = {
  grantBeneficiary: GrantBeneficiary;
  baseChangeLink: string;
  confirmationLink: string;
  backButtonLink: string;
};
export default SummaryPage;
