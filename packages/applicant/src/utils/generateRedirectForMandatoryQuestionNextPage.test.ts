import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import { generateRedirectForMandatoryQuestionNextPage } from './generateRedirectForMandatoryQuestionNextPage';

describe('generateRedirectForMandatoryQuestionNextPage', () => {
  it('should generate the correct URL for the address page when name is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      name: 'Example Organization',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-address`
    );
  });

  it('should generate the correct URL for the type page when addressLine1, city, and postcode are provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-type`
    );
  });

  it('should generate the correct URL for the companiesHouseNumberPage when orgType is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      orgType: 'Example Type',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-companies-house-number`
    );
  });

  it('should generate the correct URL for the charityCommissionNumberPage when companiesHouseNumber is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      companiesHouseNumber: 'ABC123',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-charity-commission-number`
    );
  });

  it('should generate the correct URL for the fundingAmountPage when charityCommissionNumber is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      charityCommissionNumber: 'XYZ456',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/funding-amount`
    );
  });

  it('should generate the correct URL for the fundingLocationPage when fundingAmount is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      fundingAmount: '1000',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/funding-location`
    );
  });

  it('should generate an empty destination when none of the fields are provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {};
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/summary`
    );
  });
});
