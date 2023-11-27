import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import React from 'react';
import { GrantBeneficiary } from '../../../../../types/models/GrantBeneficiary';
import { getGrantBeneficiary } from '../../../../../services/GrantBeneficiaryService';
import { createMockRouter } from '../../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import SummaryPage, { getServerSideProps } from './summary.page';

jest.mock('../../../../../services/GrantBeneficiaryService');
jest.mock('../../../../../utils/jwt');

const getTestGrantBeneficiary = (overrides: any = {}) =>
  merge(
    {
      submissionId: 'testSubmissionId',
      hasProvidedAdditionalAnswers: true,
      ageGroup1: true,
      ageGroup2: false,
      ageGroup3: true,
      ageGroup4: false,
      ageGroup5: true,
      ageGroupAll: false,
      ethnicGroup1: true,
      ethnicGroup2: true,
      ethnicGroup3: true,
      ethnicGroup4: true,
      ethnicGroup5: true,
      ethnicGroupOther: false,
      ethnicOtherDetails: null,
      ethnicGroupAll: true,
      supportingDisabilities: true,
      sexualOrientationGroup1: true,
      sexualOrientationGroup2: false,
      sexualOrientationGroup3: false,
      sexualOrientationOther: false,
      sexualOrientationOtherDetails: null,
      sexualOrientationGroupAll: false,
      sexGroup1: true,
      sexGroup2: false,
      sexGroupAll: false,
    } as GrantBeneficiary,
    overrides
  );

describe('Summary page', () => {
  describe('UI', () => {
    const renderWithRouter = (ui: React.ReactNode) => {
      render(
        <RouterContext.Provider value={createMockRouter({})}>
          {ui}
        </RouterContext.Provider>
      );
    };

    const getProps = (overrides: any = {}) =>
      merge(
        {
          grantBeneficiary: getTestGrantBeneficiary(),
          baseChangeLink: '/testBaseChangeLink',
          confirmationLink: '/testConfirmationLink',
          backButtonLink: '/testBackButtonLink',
        },
        overrides
      );

    it('Should render a heading', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByRole('heading', {
        name: 'Equality questions about the grant',
      });
    });

    it('Should render a save and continue button', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('button', { name: 'Save and continue' })
      ).toHaveAttribute('href', '/testConfirmationLink');
    });

    it('Should render a back button', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/testBackButtonLink'
      );
    });

    it('Should render the selected sex groups title', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        'Does your organisation primarily focus on supporting a particular sex?'
      );
    });

    it('Should render the selected sex groups change link', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('link', {
          name: 'Change: "Does your organisation primarily focus on supporting a particular sex?"',
        })
      ).toHaveAttribute(
        'href',
        '/testBaseChangeLink/sex?returnToSummaryPage=yes'
      );
    });

    it('Should render the selected sex groups, CASE: 1', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText('Male');
    });
    it('Should render the selected sex groups, CASE: 2', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              sexGroup1: false,
              sexGroup2: true,
              sexGroupAll: true,
            },
          })}
        />
      );
      screen.getByText('No, we support both sexes');
    });
    it('Should render the selected sex groups, CASE: 3', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              sexGroup1: false,
              sexGroup2: true,
            },
          })}
        />
      );
      screen.getByText('Female');
    });

    it('Should render the selected age groups title', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        'Does your organisation primarily focus on supporting a particular age group?'
      );
    });

    it('Should render the selected age groups change link', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('link', {
          name: 'Change: "Does your organisation primarily focus on supporting a particular age group?"',
        })
      ).toHaveAttribute(
        'href',
        '/testBaseChangeLink/age?returnToSummaryPage=yes'
      );
    });

    it('Should render the selected age groups, CASE: 1', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        '0 to 14 year olds, 25 to 54 year olds, 65 year olds and over'
      );
    });

    it('Should render the selected age groups, CASE: 2', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              ageGroup1: false,
              ageGroup2: true,
              ageGroup3: false,
              ageGroup4: true,
              ageGroup5: false,
            },
          })}
        />
      );
      screen.getByText('15 to 24 year olds, 55 to 64 year olds');
    });

    it('Should render the selected age groups, CASE: ALL', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              ageGroup1: true,
              ageGroup2: true,
              ageGroup3: true,
              ageGroup4: true,
              ageGroup5: true,
              ageGroupAll: true,
            },
          })}
        />
      );
      screen.getByText('No, we support all age groups');
    });

    it('Should render the selected ethnic groups title', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        'Does your organisation primarily focus on supporting a particular ethnic group?'
      );
    });

    it('Should render the selected ethnic groups change link', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('link', {
          name: 'Change: "Does your organisation primarily focus on supporting a particular ethnic group?"',
        })
      ).toHaveAttribute(
        'href',
        '/testBaseChangeLink/ethnicity?returnToSummaryPage=yes'
      );
    });

    it('Should render the selected ethnic groups, CASE: ALL', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText('No, we support all ethnic groups');
    });

    it('Should render the selected ethnic groups, CASE: 1', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              ethnicGroup1: true,
              ethnicGroup2: false,
              ethnicGroup3: true,
              ethnicGroup4: false,
              ethnicGroup5: true,
              ethnicGroupOther: false,
              ethnicGroupAll: false,
            },
          })}
        />
      );
      screen.getByText('White, Asian or Asian British, Arab');
    });

    it('Should render the selected ethnic groups, CASE: 2', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              ethnicGroup1: false,
              ethnicGroup2: true,
              ethnicGroup3: false,
              ethnicGroup4: true,
              ethnicGroup5: false,
              ethnicGroupOther: true,
              ethnicOtherDetails: 'test ethnic other details',
              ethnicGroupAll: false,
            },
          })}
        />
      );
      screen.getByText(
        'Mixed or multiple ethnic groups, Black, African, Caribbean or Black British, test ethnic other details'
      );
    });

    it('Should render the selected supported disability groups title', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        'Does your organisation primarily focus on supporting people with mental or physical disabilities?'
      );
    });

    it('Should render the selected supported disability groups change link', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('link', {
          name: 'Change: "Does your organisation primarily focus on supporting people with mental or physical disabilities?"',
        })
      ).toHaveAttribute(
        'href',
        '/testBaseChangeLink/disability?returnToSummaryPage=yes'
      );
    });

    it('Should render the selected supported disability groups, CASE: 1', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText('Yes');
    });

    it('Should render the selected supported disability groups, CASE: 2', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              supportingDisabilities: false,
            },
          })}
        />
      );
      screen.getByText('No');
    });

    it('Should render the selected sexual orientation groups title', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText(
        'Does you organisation primarily focus on supporting a particular sexual orientation?'
      );
    });

    it('Should render the selected sexual orientation groups change link', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      expect(
        screen.getByRole('link', {
          name: 'Change: "Does you organisation primarily focus on supporting a particular sexual orientation?"',
        })
      ).toHaveAttribute(
        'href',
        '/testBaseChangeLink/sexual-orientation?returnToSummaryPage=yes'
      );
    });

    it('Should render the selected sexual orientation groups, CASE: ALL', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              sexualOrientationGroupAll: true,
              sexualOrientationGroup1: true,
              sexualOrientationGroup2: true,
              sexualOrientationGroup3: true,
              sexualOrientationOther: false,
            },
          })}
        />
      );
      screen.getByText('No, we support people of any sexual orientation');
    });

    it('Should render the selected sexual orientation groups, CASE: 1', () => {
      renderWithRouter(<SummaryPage {...getProps()} />);
      screen.getByText('Heterosexual or straight');
    });

    it('Should render the selected sexual orientation groups, CASE: 2', () => {
      renderWithRouter(
        <SummaryPage
          {...getProps({
            grantBeneficiary: {
              sexualOrientationGroupAll: false,
              sexualOrientationGroup1: false,
              sexualOrientationGroup2: true,
              sexualOrientationGroup3: true,
              sexualOrientationOther: true,
              sexualOrientationOtherDetails:
                'test other sexual orientation details',
            },
          })}
        />
      );
      screen.getByText(
        'Gay or lesbian, Bisexual, test other sexual orientation details'
      );
    });
  });

  describe('getServerSideProps', () => {
    beforeEach(() => {
      (getGrantBeneficiary as jest.Mock).mockResolvedValue(
        getTestGrantBeneficiary()
      );
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    });

    const context = {
      params: {
        submissionId: 'testSubmissionId',
        grantBeneficiaryId: 'testGrantBeneficiaryId',
      },
    } as any;

    it('Should return a grantBeneficiary prop', async () => {
      const result = (await getServerSideProps(
        context
      )) as NextGetServerSidePropsResponse;

      expect(result.props.grantBeneficiary).toStrictEqual(
        getTestGrantBeneficiary()
      );
      expect(getGrantBeneficiary as jest.Mock).toHaveBeenNthCalledWith(
        1,
        'testSubmissionId',
        'testJwt'
      );
    });

    it('Should redirect to the service error page when fetching the grant beneficiary fails', async () => {
      (getGrantBeneficiary as jest.Mock).mockRejectedValue({});

      const result = await getServerSideProps(context);

      expect(result).toStrictEqual({
        redirect: {
          statusCode: 302,
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to upload your equality and diversity responses","linkAttributes":{"href":"/submissions/testSubmissionId/equality-and-diversity","linkText":"Please return","linkInformation":" and try again."}}`,
        },
      });
    });

    it('Should return a base change link prop', async () => {
      const result = (await getServerSideProps(
        context
      )) as NextGetServerSidePropsResponse;

      expect(result.props.baseChangeLink).toStrictEqual(
        '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId'
      );
    });

    it('Should return a confirmation link prop', async () => {
      const result = (await getServerSideProps(
        context
      )) as NextGetServerSidePropsResponse;

      expect(result.props.confirmationLink).toStrictEqual(
        '/submissions/testSubmissionId/equality-and-diversity/confirmation'
      );
    });
  });
});
