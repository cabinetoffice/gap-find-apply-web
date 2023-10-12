import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import { generateRedirectForMandatoryQuestionNextPage } from './generateRedirectForMandatoryQuestionNextPage';

describe('generateRedirectForMandatoryQuestionNextPage', () => {
  it('should generate the correct URL for the address page when name is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      name: 'Example Organization',
      addressLine1: null,
      city: null,
      postcode: null,
      orgType: null,
      companiesHouseNumber: null,
      charityCommissionNumber: null,
      fundingAmount: null,
      fundingLocation: null,
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-address`
    );
  });

  it('should generate the correct URL for the type page when addressLine1, city, and postcode are provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      orgType: null,
      companiesHouseNumber: null,
      charityCommissionNumber: null,
      fundingAmount: null,
      fundingLocation: null,
    };

    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-type`
    );
  });

  it('should generate the correct URL for the companiesHouseNumberPage when orgType is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      companiesHouseNumber: null,
      charityCommissionNumber: null,
      fundingAmount: null,
      fundingLocation: null,
      orgType: 'Example Type',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-companies-house-number`
    );
  });

  it('should generate the correct URL for the charityCommissionNumberPage when companiesHouseNumber is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      orgType: 'Example Type',
      charityCommissionNumber: null,
      fundingAmount: null,
      fundingLocation: null,
      companiesHouseNumber: 'ABC123',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-charity-commission-number`
    );
  });

  it('should generate the correct URL for the fundingAmountPage when charityCommissionNumber is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      orgType: 'Example Type',
      fundingAmount: null,
      fundingLocation: null,
      companiesHouseNumber: 'ABC123',
      charityCommissionNumber: 'XYZ456',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/funding-amount`
    );
  });

  it('should generate the correct URL for the fundingLocationPage when fundingAmount is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      orgType: 'Example Type',
      fundingAmount: '1000',
      fundingLocation: null,
      companiesHouseNumber: 'ABC123',
      charityCommissionNumber: 'XYZ456',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/funding-location`
    );
  });

  it('should generate the correct URL  when everything  is provided', () => {
    const mandatoryQuestion: GrantMandatoryQuestionDto = {
      addressLine1: '123 Main St',
      city: 'Example City',
      postcode: '12345',
      name: 'name',
      orgType: 'Example Type',
      fundingAmount: '1000',
      fundingLocation: 'location',
      companiesHouseNumber: 'ABC123',
      charityCommissionNumber: 'XYZ456',
    };
    const mandatoryQuestionId = 'mandatoryQuestionId';

    const result = generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      false
    );

    expect(result.redirect.destination).toBe(
      `/mandatory-questions/mandatoryQuestionId/summary`
    );
  });
});
