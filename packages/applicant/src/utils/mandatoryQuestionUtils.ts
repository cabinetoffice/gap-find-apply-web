import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import { routes } from './routes';

export const generateRedirectUrlForMandatoryQuestionNextPage = (
  mandatoryQuestion: GrantMandatoryQuestionDto,
  mandatoryQuestionId: string
): string => {
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
    return routes.mandatoryQuestions.summaryPage(mandatoryQuestionId);
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
    return routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId);
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
    return routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId);
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null &&
    mandatoryQuestion.companiesHouseNumber !== null
  ) {
    return routes.mandatoryQuestions.charityCommissionNumberPage(
      mandatoryQuestionId
    );
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null &&
    mandatoryQuestion.orgType !== null
  ) {
    return routes.mandatoryQuestions.companiesHouseNumberPage(
      mandatoryQuestionId
    );
  }
  if (
    mandatoryQuestion.name !== null &&
    mandatoryQuestion.addressLine1 !== null &&
    mandatoryQuestion.city !== null &&
    mandatoryQuestion.postcode !== null
  ) {
    return routes.mandatoryQuestions.typePage(mandatoryQuestionId);
  }
  if (mandatoryQuestion.name !== null) {
    return routes.mandatoryQuestions.addressPage(mandatoryQuestionId);
  }
};

const mapper = {
  'organisation-name': 'name',
  'organisation-address': ['addressLine1', 'city', 'postcode'],
  'organisation-type': 'orgType',
  'organisation-companies-house-number': 'companiesHouseNumber',
  'organisation-charity-commission-number': 'charityCommissionNumber',
  'organisation-funding-amount': 'fundingAmount',
  'organisation-funding-location': 'fundingLocation',
};

export const getMandatoryQuestionKeyFromUrl = (url: string) => {
  const question = url.split('/').pop().split('?')[0];
  const questionKey = mapper[question];
  return questionKey;
};

export const checkIfPageHaveAlreadyBeenAnswered = (
  mandatoryQuestion: GrantMandatoryQuestionDto,
  url: string
): boolean => {
  const questionKey = getMandatoryQuestionKeyFromUrl(url);
  if (!questionKey) {
    return false;
  }
  if (Array.isArray(questionKey)) {
    return questionKey.every((key) => mandatoryQuestion[key] !== null);
  }
  return mandatoryQuestion[questionKey] !== null;
};
