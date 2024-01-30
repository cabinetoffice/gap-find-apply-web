import { render, screen } from '@testing-library/react';
import { Optional, getContext } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import InferProps from '../../../../../../types/InferProps';
import { getPageProps } from '../../../../../../testUtils/unitTestHelpers';
import { changeSchemeOwnership } from '../../../../../../services/SchemeService';
import { parseBody } from '../../../../../../utils/parseBody';
import ConfirmChangeOwnerPage, {
  getServerSideProps,
} from './confirm-change-owner.page';

jest.mock('../../../../../../services/SchemeService');
jest.mock('../../../../../../utils/parseBody');

describe('Super admin - Confirm change owner page', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      pageData: {
        schemeName: 'Test Scheme',
        schemeId: 'testSchemeId',
        userId: 'testUserId',
        newEmailAddress: 'newEmail@test.com',
        oldEmailAddress: 'oldEmail@test.com',
      },
      previousValues: { emailAddress: '' },
      csrfToken: 'csrfToken',
      formAction: '/test',
      fieldErrors: [],
    });

    it('Should render a title tag', () => {
      render(<ConfirmChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(document.title).toBe('Manage User - Confirm Change Scheme Owner');
    });

    it('Should render a back button', () => {
      render(<ConfirmChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/super-admin-dashboard/user/testUserId/schemes/testSchemeId/change-owner?oldEmailAddress=oldEmail%40test.com&newEmailAddress=newEmail%40test.com&schemeName=Test+Scheme'
      );
    });

    it('Should render the scheme name', () => {
      render(<ConfirmChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('Test Scheme');
    });

    it('Should render the old and new email address', () => {
      render(<ConfirmChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      screen.getByText((content, node) => {
        if (!node) return true;
        const hasText = (node: Element) =>
          node.textContent ===
          'The grant Test Scheme will be transferred from oldEmail@test.com to newEmail@test.com.';
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every(
          (child) => !hasText(child)
        );
        return nodeHasText && childrenDontHaveText;
      });
    });

    it('Should render a cancel button', () => {
      render(<ConfirmChangeOwnerPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
        'href',
        '/apply/super-admin-dashboard/user/testUserId/schemes/testSchemeId/change-owner?oldEmailAddress=oldEmail%40test.com&newEmailAddress=newEmail%40test.com&schemeName=Test+Scheme'
      );
    });
  });

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        id: 'testUserId',
        schemeId: 'testSchemeId',
      },
      query: {
        oldEmailAddress: 'oldEmail%40test.com',
        newEmailAddress: 'newEmail%40test.com',
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

    const mockedChangeOwnership = jest.mocked(changeSchemeOwnership);
    const mockedParseBody = jest.mocked(parseBody);

    beforeEach(() => {
      mockedParseBody.mockResolvedValue({ emailAddress: 'test@gmail.com' });
    });

    it('Should fetch the grant scheme', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props.pageData).toEqual(
        expect.objectContaining({
          schemeName: 'Test Scheme',
          schemeId: 'testSchemeId',
        })
      );
    });

    it('Should return the userId & email addresses', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props.pageData).toEqual(
        expect.objectContaining({
          userId: 'testUserId',
          oldEmailAddress: 'oldEmail@test.com',
          newEmailAddress: 'newEmail@test.com',
        })
      );
    });

    it('Should update ownership', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, { req: { method: 'POST' } })
      );

      if ('props' in result) throw new Error('Should not return props');

      expect(mockedChangeOwnership).toHaveBeenCalledWith(
        'testSchemeId',
        'testSessionId',
        'jwt',
        'newEmail@test.com'
      );
      expect(result.redirect).toEqual(
        expect.objectContaining({
          destination: '/super-admin-dashboard/user/testUserId',
        })
      );
    });
  });
});
