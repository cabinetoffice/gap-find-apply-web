import { render, screen } from '@testing-library/react';
import { Optional, getContext, mockServiceMethod } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import InferProps from '../../../../../../types/InferProps';
import ChangeOwnerPage, { getServerSideProps } from './change-owner.page';
import { getPageProps } from '../../../../../../testUtils/unitTestHelpers';
import { checkNewAdminEmailIsValid } from '../../../../../../services/UserService';
import { parseBody } from '../../../../../../utils/parseBody';

jest.mock('../../../../../../services/UserService');
jest.mock('../../../../../../services/SchemeService');
jest.mock('../../../../../../utils/parseBody');

describe('Super admin - Change owner page', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      pageData: {
        schemeName: 'Test Scheme',
        prevEmailAddress: null,
        userId: 'testUserId',
      },
      previousValues: { emailAddress: '' },
      csrfToken: 'csrfToken',
      formAction: '/test',
      fieldErrors: [],
    });

    it('Should render a title tag', () => {
      render(<ChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(document.title).toBe('Manage User - Change Scheme Owner');
    });

    it('Should render a title tag with Error when there are validation errors', () => {
      render(
        <ChangeOwnerPage
          {...getPageProps(getDefaultProps, {
            fieldErrors: [
              {
                fieldName: 'emailAddress',
                errorMessage: 'Please enter an email',
              },
            ],
          })}
        />
      );

      expect(document.title).toBe('Error: Manage User - Change Scheme Owner');
    });

    it('Should render a back button', () => {
      render(<ChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/admin/super-admin-dashboard/user/testUserId'
      );
    });

    it('Should render the scheme name', () => {
      render(<ChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('Test Scheme');
    });

    it('Should render a text input', () => {
      render(<ChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(
        screen.getByRole('textbox', { name: "New owner's email address" })
      ).toHaveValue('');
    });

    it('The text input should default to previousValue if it exists', () => {
      render(
        <ChangeOwnerPage
          {...getPageProps(getDefaultProps, {
            previousValues: { emailAddress: 'test@gmail.com' },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { name: "New owner's email address" })
      ).toHaveValue('test@gmail.com');
    });

    it('The text input should default to prevEmailAddress if it exists', () => {
      render(
        <ChangeOwnerPage
          {...getPageProps(getDefaultProps, {
            previousValues: { emailAddress: null as unknown as undefined },
            pageData: { prevEmailAddress: 'test@gmail.com' },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { name: "New owner's email address" })
      ).toHaveValue('test@gmail.com');
    });

    it('Should render a field error when there is one', () => {
      render(
        <ChangeOwnerPage
          {...getPageProps(getDefaultProps, {
            fieldErrors: [
              {
                fieldName: 'emailAddress',
                errorMessage: 'Please enter an email',
              },
            ],
          })}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Please enter an email' })
      ).toHaveAttribute('href', '#emailAddress');
      expect(screen.getAllByText('Please enter an email')).toHaveLength(2);
    });
  });

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        id: 'testUserId',
        schemeId: 'testSchemeId',
      },
      query: {
        oldEmailAddress: 'oldemail%40gov.uk',
        schemeName: 'Test Scheme',
      },
      req: {
        cookies: {
          'user-service-token': 'jwt',
          sessionId: 'testSessionId',
        },
      },
      res: { getHeader: () => 'testCSRFToken' },
    });

    const mockedCheckNewAdminEmailIsValid = jest.mocked(
      checkNewAdminEmailIsValid
    );
    const mockedParseBody = jest.mocked(parseBody);

    beforeEach(() => {
      mockServiceMethod(mockedCheckNewAdminEmailIsValid, () => true);
      mockedParseBody.mockResolvedValue({ emailAddress: 'test@gmail.com' });
    });

    it('Should fetch the grant scheme', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props.pageData).toEqual(
        expect.objectContaining({
          schemeName: 'Test Scheme',
          userId: 'testUserId',
        })
      );
    });

    it('Should return the userId', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props.pageData).toEqual(
        expect.objectContaining({
          userId: 'testUserId',
        })
      );
    });

    it('Should validate the new owner email address', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, { req: { method: 'POST' } })
      );

      if ('props' in result) throw new Error('Should not return props');

      expect(mockedCheckNewAdminEmailIsValid).toHaveBeenCalledWith(
        'testSessionId',
        'jwt',
        'test@gmail.com',
        'oldemail@gov.uk'
      );
      expect(result.redirect).toEqual(
        expect.objectContaining({
          destination:
            '/super-admin-dashboard/user/testUserId/schemes/testSchemeId/confirm-change-owner?newEmailAddress=test%40gmail.com&oldEmailAddress=oldemail%40gov.uk&schemeName=Test+Scheme',
        })
      );
    });
  });
});
