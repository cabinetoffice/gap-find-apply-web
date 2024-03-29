import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
import { Optional } from '../../../testUtils/unitTestHelpers';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes, serviceErrorPropType } from '../../../utils/routes';
import { MQ_ORG_TYPES } from '../../../utils/constants';
import { GrantApplicantOrganisationProfileService } from '../../../services/GrantApplicantOrganisationProfileService';

const isIndividualOrNonLimitedCompanyOrLocalAuthority = (orgType: string) =>
  [
    MQ_ORG_TYPES.INDIVIDUAL,
    MQ_ORG_TYPES.NON_LIMITED_COMPANY,
    MQ_ORG_TYPES.LOCAL_AUTHORITY,
  ].includes(orgType);

const getRelatedOrgTypePages = ({
  orgType,
  mandatoryQuestionId,
  addressPage,
  fundingAmountPage,
}) => {
  const charityCommissionNumberPage =
    routes.mandatoryQuestions.charityCommissionNumberPage(mandatoryQuestionId);
  const companiesHouseNumberPage =
    routes.mandatoryQuestions.companiesHouseNumberPage(mandatoryQuestionId);

  return isIndividualOrNonLimitedCompanyOrLocalAuthority(orgType)
    ? {
        [fundingAmountPage]: addressPage,
      }
    : {
        [fundingAmountPage]: charityCommissionNumberPage,
        [charityCommissionNumberPage]: companiesHouseNumberPage,
        [companiesHouseNumberPage]: addressPage,
      };
};

const buildBackButtonMapper = (
  orgType: string,
  mandatoryQuestionId: string,
  schemeId: number
): { [p: string]: string } => {
  const externalApplicationPage =
    routes.mandatoryQuestions.externalApplicationPage(mandatoryQuestionId);
  const summaryPage =
    routes.mandatoryQuestions.summaryPage(mandatoryQuestionId);
  const fundingLocationPage =
    routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId);
  const fundingAmountPage =
    routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId);
  const addressPage =
    routes.mandatoryQuestions.addressPage(mandatoryQuestionId);
  const namePage = routes.mandatoryQuestions.namePage(mandatoryQuestionId);
  const typePage = routes.mandatoryQuestions.typePage(mandatoryQuestionId);
  const startPage = routes.mandatoryQuestions.startPage(schemeId.toString());
  return {
    [externalApplicationPage]: summaryPage,
    [summaryPage]: fundingLocationPage,
    [fundingLocationPage]: fundingAmountPage,
    ...getRelatedOrgTypePages({
      orgType,
      mandatoryQuestionId,
      addressPage,
      fundingAmountPage,
    }),
    [addressPage]: namePage,
    [namePage]: typePage,
    [typePage]: startPage,
  };
};

const mapBackButtonUrl = (
  resolvedUrl: string,
  mandatoryQuestion: GrantMandatoryQuestionDto,
  mandatoryQuestionId: string,
  fromSummaryPage: boolean,
  fromSubmissionPage: boolean,
  fromSubmissionSummaryPage: boolean,
  submissionId: string,
  sectionId: string,
  isOrgProfileComplete: boolean
) => {
  if (fromSubmissionPage) {
    return routes.submissions.section(submissionId, sectionId);
  } else if (fromSubmissionSummaryPage) {
    return routes.submissions.summary(submissionId);
  } else if (fromSummaryPage) {
    return routes.mandatoryQuestions.summaryPage(mandatoryQuestionId);
  } else if (
    isOrgProfileComplete &&
    resolvedUrl.includes('organisation-funding-amount')
  ) {
    return routes.mandatoryQuestions.startPage(
      mandatoryQuestion.schemeId.toString()
    );
  } else {
    const mapper = buildBackButtonMapper(
      mandatoryQuestion.orgType,
      mandatoryQuestionId,
      mandatoryQuestion.schemeId
    );
    return mapper[resolvedUrl];
  }
};

const createServiceErrorProps = (
  errorInformation: string,
  href: string
): serviceErrorPropType => ({
  errorInformation,
  linkAttributes: {
    href,
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
});

export default async function getServerSideProps({
  req,
  res,
  params,
  query,
  resolvedUrl, //the url that the user requested
}: GetServerSidePropsContext) {
  const { mandatoryQuestionId } = params as Record<string, string>;
  const {
    fromSummaryPage,
    fromSubmissionPage,
    fromSubmissionSummaryPage,
    submissionId,
    sectionId,
  } = query as Record<string, string>;
  const isFromSummaryPage = fromSummaryPage === 'true';
  const isFromSubmissionPage = fromSubmissionPage === 'true';
  const isFromSubmissionSummaryPage = fromSubmissionSummaryPage === 'true';
  const jwt = getJwtFromCookies(req);
  const { publicRuntimeConfig } = getConfig();

  let mandatoryQuestion: GrantMandatoryQuestionDto;
  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();
  const grantApplicantOrganisationProfileService =
    GrantApplicantOrganisationProfileService.getInstance();

  const isOrgProfileComplete =
    await grantApplicantOrganisationProfileService.isOrgProfileComplete(jwt);

  try {
    mandatoryQuestion =
      await grantMandatoryQuestionService.getMandatoryQuestionById(
        mandatoryQuestionId,
        jwt
      );
  } catch (e) {
    const serviceErrorProps = createServiceErrorProps(
      'Something went wrong while trying to get the page you requested',
      resolvedUrl
    );
    return {
      redirect: {
        destination: routes.serviceError(serviceErrorProps),
        statusCode: 302,
      },
    };
  }

  //this is where we update the mandatory question.
  const response = await callServiceMethod(
    req,
    res,
    //the post/patch request that we are making to the backend
    (body) =>
      grantMandatoryQuestionService.updateMandatoryQuestion(
        jwt,
        mandatoryQuestionId,
        resolvedUrl,
        body
      ),
    //the above method will return a string with the next page url
    (result) => {
      if (isFromSummaryPage) {
        return routes.mandatoryQuestions.summaryPage(mandatoryQuestionId);
      } else if (isFromSubmissionPage) {
        return routes.submissions.section(submissionId, sectionId);
      } else if (isFromSubmissionSummaryPage) {
        return routes.submissions.summary(submissionId);
      } else {
        return result;
      }
    },
    createServiceErrorProps(
      'Something went wrong while trying to update your organisation details',
      resolvedUrl
    )
  );

  if ('redirect' in response) {
    return response;
  }

  let defaultFields = mandatoryQuestion as Optional<GrantMandatoryQuestionDto>;
  let fieldErrors = [] as ValidationError[];

  //if there are validation errors we fill up the default fields with the values that the user has entered, and field errors with the errors
  if ('fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    defaultFields = response.body as Optional<GrantMandatoryQuestionDto>;
  }

  const backButtonUrl = mapBackButtonUrl(
    resolvedUrl,
    mandatoryQuestion,
    mandatoryQuestionId,
    isFromSummaryPage,
    isFromSubmissionPage,
    isFromSubmissionSummaryPage,
    submissionId,
    sectionId,
    isOrgProfileComplete
  );

  return {
    props: {
      csrfToken: res.getHeader('x-csrf-token') as string,
      formAction: publicRuntimeConfig.subPath + resolvedUrl,
      fieldErrors,
      defaultFields,
      mandatoryQuestion,
      mandatoryQuestionId,
      backButtonUrl,
    },
  };
}
