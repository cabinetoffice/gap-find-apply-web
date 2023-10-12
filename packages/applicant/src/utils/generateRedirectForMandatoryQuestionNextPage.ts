import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import { routes } from './routes';

export const generateRedirectForMandatoryQuestionNextPage = (
  mandatoryQuestion: GrantMandatoryQuestionDto,
  mandatoryQuestionId: string,
  isRequestFromSummaryPage: boolean
) => {
  if (isRequestFromSummaryPage) {
    return;
  }
  const redirect = {
    destination: routes.mandatoryQuestions.summaryPage(mandatoryQuestionId),
    permanent: false,
  };
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null &&
    mandatoryQuestion.companiesHouseNumber !== null &&
    mandatoryQuestion.charityCommissionNumber !== null &&
    mandatoryQuestion.fundingAmount !== null &&
    mandatoryQuestion.fundingLocation !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.summaryPage(mandatoryQuestionId);
    return { redirect };
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null &&
    mandatoryQuestion.companiesHouseNumber !== null &&
    mandatoryQuestion.charityCommissionNumber !== null &&
    mandatoryQuestion.fundingAmount !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId);
    return { redirect };
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null &&
    mandatoryQuestion.companiesHouseNumber !== null &&
    mandatoryQuestion.charityCommissionNumber !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId);
    return { redirect };
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null &&
    mandatoryQuestion.companiesHouseNumber !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.charityCommissionNumberPage(
        mandatoryQuestionId
      );
    return { redirect };
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.companiesHouseNumberPage(mandatoryQuestionId);
    return { redirect };
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null
  ) {
    redirect.destination =
      routes.mandatoryQuestions.typePage(mandatoryQuestionId);
    return { redirect };
  }
  if (mandatoryQuestion.name !== null) {
    redirect.destination =
      routes.mandatoryQuestions.addressPage(mandatoryQuestionId);
    return { redirect };
  }
};
