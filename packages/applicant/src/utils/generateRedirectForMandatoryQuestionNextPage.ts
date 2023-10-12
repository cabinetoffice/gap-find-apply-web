import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import { routes } from './routes';

export const generateRedirectForMandatoryQuestionNextPage = (
  mandatoryQuestion: GrantMandatoryQuestionDto,
  mandatoryQuestionId: string
) => {
  const redirect = {
    destination: routes.mandatoryQuestions.summaryPage(mandatoryQuestionId),
    permanent: false,
  };
  if (mandatoryQuestion.name) {
    redirect.destination =
      routes.mandatoryQuestions.addressPage(mandatoryQuestionId);
  }
  if (
    !!mandatoryQuestion.addressLine1 &&
    !!mandatoryQuestion.city &&
    !!mandatoryQuestion.postcode
  ) {
    redirect.destination =
      routes.mandatoryQuestions.typePage(mandatoryQuestionId);
  }
  if (mandatoryQuestion.orgType) {
    redirect.destination =
      routes.mandatoryQuestions.companiesHouseNumberPage(mandatoryQuestionId);
  }
  if (mandatoryQuestion.companiesHouseNumber) {
    redirect.destination =
      routes.mandatoryQuestions.charityCommissionNumberPage(
        mandatoryQuestionId
      );
  }
  if (mandatoryQuestion.charityCommissionNumber) {
    redirect.destination =
      routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId);
  }
  if (mandatoryQuestion.fundingAmount) {
    redirect.destination =
      routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId);
  }
  return redirect;
};
