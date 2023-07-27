import { GetServerSidePropsContext } from 'next';
import { GrantApplicant } from '../../models/GrantApplicant';
import {
  expectObjectEquals,
  getContext,
  mockServiceMethod,
  Optional,
} from '../../utils/UnitTestHelpers';
import getServerSideProps from './getServerSideProps';
import { parseBody } from 'next/dist/server/api-utils/node';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { GrantApplicantOrganisationProfileService } from '../../services/GrantApplicantOrganisationProfileService';

jest.mock('next/dist/server/api-utils/node');

const spiedGrantApplicantService = jest.spyOn(
  GrantApplicantService.prototype,
  'getGrantApplicant'
);

const spiedGrantApplicantOrganisationProfileService = jest.spyOn(
  GrantApplicantOrganisationProfileService.prototype,
  'updateOrganisation'
);

describe('getServerSideProps', () => {
  const getDefaultGrantApplicant = (): GrantApplicant => ({
    id: 'testApplicantId',
    email: 'test@email.com',
    organisation: {
      id: 'testOrganisationId',
      legalName: 'Chris charity',
      addressLine1: 'First Line',
      addressLine2: 'Second Line',
      town: 'Edinburgh',
      county: 'Lothian',
      postcode: 'EH22 2TH',
      type: 'Limited',
      companiesHouseNumber: '98239829382',
      charityCommissionNumber: '09090909',
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.USER_TOKEN_NAME = 'gap-test';
  });

  describe('when handling a GET request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({});

    it('should return the right props', async () => {
      mockServiceMethod(spiedGrantApplicantService, getDefaultGrantApplicant);

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          organisationId: 'testOrganisationId',
          defaultFields: getDefaultGrantApplicant().organisation,
        },
      });
    });

    it('Should call getGrantApplicant', async () => {
      mockServiceMethod(spiedGrantApplicantService, getDefaultGrantApplicant);

      await getServerSideProps(getContext(getDefaultContext));

      expect(spiedGrantApplicantService).toHaveBeenNthCalledWith(
        1,
        'testSessionId'
      );
    });
  });

  describe('when handling a POST request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      req: {
        method: 'POST',
      },
    });

    beforeEach(() => {
      mockServiceMethod(spiedGrantApplicantService, getDefaultGrantApplicant);
      (parseBody as jest.Mock).mockResolvedValue({
        addressLine1: 'test address line 1',
        addressLine2: 'test address line 2',
        town: 'test town',
        county: 'test county',
        postcode: 'test postcode',
      });
    });

    it('Should update the organisation', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      expect(
        spiedGrantApplicantOrganisationProfileService
      ).toHaveBeenNthCalledWith(
        1,
        {
          addressLine1: 'test address line 1',
          addressLine2: 'test address line 2',
          town: 'test town',
          county: 'test county',
          postcode: 'test postcode',
        },
        'testSessionId'
      );
    });

    it('Should redirect to the org index page after successfully updating', async () => {
      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: '/organisation',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page if there is an error when updating', async () => {
      spiedGrantApplicantOrganisationProfileService.mockRejectedValueOnce(
        'Error'
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update your organisation details","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should return field errors upon a validation error', async () => {
      spiedGrantApplicantOrganisationProfileService.mockRejectedValueOnce({
        response: {
          data: {
            errors: [
              {
                fieldName: 'type',
                errorMessage: 'Some validation error',
              },
            ],
          },
        },
      });

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          fieldErrors: [
            { fieldName: 'type', errorMessage: 'Some validation error' },
          ],
          csrfToken: 'testCSRFToken',
          formAction: '/testResolvedURL',
          organisationId: 'testOrganisationId',
          defaultFields: {
            addressLine1: 'test address line 1',
            addressLine2: 'test address line 2',
            town: 'test town',
            county: 'test county',
            postcode: 'test postcode',
          },
        },
      });
    });
  });
});
