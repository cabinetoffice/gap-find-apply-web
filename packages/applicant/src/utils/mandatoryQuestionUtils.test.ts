import { GrantMandatoryQuestionDto } from '../services/GrantMandatoryQuestionService';
import {
  checkIfPageHaveAlreadyBeenAnswered,
  generateRedirectUrlForMandatoryQuestionNextPage,
  getMandatoryQuestionKeyFromUrl,
} from './mandatoryQuestionUtils';
import { routes } from './routes';

describe('generateRedirectUrlForMandatoryQuestionNextPage', () => {
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-funding-amount`
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-funding-location`
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

    const result = generateRedirectUrlForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId
    );

    expect(result).toBe(
      `/mandatory-questions/mandatoryQuestionId/organisation-summary`
    );
  });
});

describe('getObjectKeyFromUrl', () => {
  it('should return the correct key for the name page', () => {
    const url = routes.mandatoryQuestions.namePage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('name');
  });
  it('should return the correct key for the name page even with query', () => {
    const url = routes.mandatoryQuestions.namePage('id') + '?name=Example';
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('name');
  });
  it('should return the correct keys for the address page', () => {
    const url = routes.mandatoryQuestions.addressPage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toStrictEqual(['addressLine1', 'city', 'postcode']);
  });
  it('should return the correct key for the type page', () => {
    const url = routes.mandatoryQuestions.typePage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('orgType');
  });
  it('should return the correct key for the charity Commission Number page', () => {
    const url = routes.mandatoryQuestions.charityCommissionNumberPage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('charityCommissionNumber');
  });

  it('should return the correct key for the Companies House number  page', () => {
    const url = routes.mandatoryQuestions.companiesHouseNumberPage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('companiesHouseNumber');
  });

  it('should return the correct key for the funding amount  page', () => {
    const url = routes.mandatoryQuestions.fundingAmountPage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('fundingAmount');
  });

  it('should return the correct key for the funding location  page', () => {
    const url = routes.mandatoryQuestions.fundingLocationPage('id');
    const result = getMandatoryQuestionKeyFromUrl(url);
    expect(result).toBe('fundingLocation');
  });
});

describe('checkIfPageHaveAlreadyBeenAnswered', () => {
  describe('return true scenarios', () => {
    const mandatoryQuestionWithAllAnswers: GrantMandatoryQuestionDto = {
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
    it('should return true if the name page have already been answered', () => {
      const url = routes.mandatoryQuestions.namePage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });
    it('should return true if the address page have already been answered', () => {
      const url = routes.mandatoryQuestions.addressPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });
    it('should return true if the type page have already been answered', () => {
      const url = routes.mandatoryQuestions.typePage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });

    it('should return true if the charity Commission Number page have already been answered', () => {
      const url = routes.mandatoryQuestions.charityCommissionNumberPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });

    it('should return true if the charity Companies House number have already been answered', () => {
      const url = routes.mandatoryQuestions.companiesHouseNumberPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });

    it('should return true if the charity funding amount have already been answered', () => {
      const url = routes.mandatoryQuestions.fundingAmountPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });

    it('should return true if the charity funding location have already been answered', () => {
      const url = routes.mandatoryQuestions.fundingLocationPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithAllAnswers,
        url
      );
      expect(result).toBe(true);
    });
  });
  describe('return false scenarios', () => {
    const mandatoryQuestionWithNoAnswers: GrantMandatoryQuestionDto = {
      addressLine1: null,
      city: null,
      postcode: null,
      name: null,
      orgType: null,
      fundingAmount: null,
      fundingLocation: null,
      companiesHouseNumber: null,
      charityCommissionNumber: null,
    };

    it('should return false if a random page is used', () => {
      const url = 'www.example.com/random/page?page=1';
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });
    it('should return false if the name page have not been answered', () => {
      const url = routes.mandatoryQuestions.namePage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });
    it('should return false if the address page address Line 1 have not been answered', () => {
      const url = routes.mandatoryQuestions.addressPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        { addressLine1: null, city: 'city', postcode: 'postcode' },
        url
      );
      expect(result).toBe(false);
    });
    it('should return false if the address page city have not been answered', () => {
      const url = routes.mandatoryQuestions.addressPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        { addressLine1: 'addressLine1', city: null, postcode: 'postcode' },
        url
      );
      expect(result).toBe(false);
    });
    it('should return false if the address page postcode have not been answered', () => {
      const url = routes.mandatoryQuestions.addressPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        { addressLine1: 'addressLine1', city: 'city', postcode: null },
        url
      );
      expect(result).toBe(false);
    });
    it('should return false if the type page have not been answered', () => {
      const url = routes.mandatoryQuestions.typePage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });

    it('should return false if the charity Commission Number page have not been answered', () => {
      const url = routes.mandatoryQuestions.charityCommissionNumberPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });

    it('should return false if the charity Companies House number have not been answered', () => {
      const url = routes.mandatoryQuestions.companiesHouseNumberPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });

    it('should return false if the charity funding amount have not been answered', () => {
      const url = routes.mandatoryQuestions.fundingAmountPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });

    it('should return false if the charity funding location have not been answered', () => {
      const url = routes.mandatoryQuestions.fundingLocationPage('id');
      const result = checkIfPageHaveAlreadyBeenAnswered(
        mandatoryQuestionWithNoAnswers,
        url
      );
      expect(result).toBe(false);
    });
  });
});
