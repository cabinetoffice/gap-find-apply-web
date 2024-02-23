import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { merge } from 'lodash';
import CompletedSubmissions, { getServerSideProps } from './index.page';
import { downloadFile, isJSEnabled } from '../../../../utils/general';
import { getGrantScheme } from '../../../../services/SchemeService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import { getCompletedSubmissionExportList } from '../../../../services/SubmissionsService';

jest.mock('../../../../utils/general');
jest.mock('../../../../services/SchemeService');
jest.mock('../../../../services/SubmissionsService');

const submissionList = [
  { label: 'some name', url: '#1' },
  { label: 'some other name', url: '#2' },
  { label: 'some third name', url: '#3' },
];

const customProps = {
  formAction: '',
  schemeName: '',
  submissionList,
  csrfToken: '',
};

const component = <CompletedSubmissions {...customProps} />;
const SCHEME_ID = 'testSchemeId';
const EXPORT_ID = 'testExportId';

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: SCHEME_ID,
        exportId: EXPORT_ID,
      } as Record<string, string>,
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
        headers: { referer: '/testRefererPage' },
      } as any,
      res: {
        getHeader: () => 'testCSRFToken',
      },
      resolvedUrl: '/testResolvedURL',
    } as unknown as GetServerSidePropsContext,
    overrides
  );

// Temporary placeholder to be deleted once we unskip tests
describe.skip('Completed submissions page', () => {
  describe('UI', () => {
    it('Should render a meta title correctly', () => {
      render(component);
      expect(document.title).toBe('Completed submissions');
    });

    it('Should render the question page layout output', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Should render the table component output', () => {
      render(component);
      screen.getByTestId('table-caption');
    });

    describe('There are completed submissions', () => {
      it('Should render a "Download" link for each row of the table', () => {
        render(component);
        screen.getByRole('link', { name: 'Download submission "some name"' });
        screen.getByRole('link', {
          name: 'Download submission "some other name"',
        });
        screen.getByRole('link', {
          name: 'Download submission "some third name"',
        });
      });

      describe('Browser JavaScript disabled', () => {
        beforeEach(() => {
          (isJSEnabled as jest.Mock).mockReturnValue(false);
        });

        it('Should NOT render a "Select all" checkbox for the table', () => {
          render(component);
          expect(
            screen.queryByRole('checkbox', { name: 'Select all' })
          ).toBeFalsy();
        });

        it('Should NOT render a checkbox for each row of the table', () => {
          render(component);

          expect(
            screen.queryByRole('checkbox', { name: submissionList[0].label })
          ).toBeFalsy();
          expect(
            screen.queryByRole('checkbox', { name: submissionList[1].label })
          ).toBeFalsy();
          expect(
            screen.queryByRole('checkbox', { name: submissionList[2].label })
          ).toBeFalsy();
        });

        it('Should NOT render "Download selected" button', () => {
          render(component);
          expect(
            screen.queryByRole('button', { name: 'Download selected' })
          ).toBeFalsy();
        });
      });

      describe('Browser JavaScript enabled', () => {
        beforeEach(() => {
          (isJSEnabled as jest.Mock).mockReturnValue(true);
        });

        it('Should render a "Select all" checkbox for the table', () => {
          render(component);
          screen.getByRole('checkbox', { name: 'Select all' });
        });

        it('Should render a checkbox for each row of the table', () => {
          render(component);

          screen.getByRole('checkbox', { name: submissionList[0].label });
          screen.getByRole('checkbox', { name: submissionList[1].label });
          screen.getByRole('checkbox', { name: submissionList[2].label });
        });

        it('Should render "Download selected" button in a disabled state when no checkboxes are checked', () => {
          render(component);
          expect(
            screen.getByRole('button', { name: 'Download selected' })
          ).toHaveAttribute('disabled');
        });

        it('Should render "Download selected" button NOT in a disabled state when at least 1 checkbox is checked', () => {
          render(component);
          const checkbox = screen.getByRole('checkbox', {
            name: submissionList[0].label,
          });

          checkbox.click();

          expect(
            screen.getByRole('button', { name: 'Download selected' })
          ).not.toHaveAttribute('disabled');
        });
      });
    });

    describe('There are no submissions', () => {
      // Some sort of redirection? Will cover in unhappy paths and integration
    });
  });

  describe('Logic', () => {
    beforeEach(() => {
      (isJSEnabled as jest.Mock).mockReturnValue(true);
    });

    describe('getServerSideProps', () => {
      beforeEach(() => {
        (getGrantScheme as jest.Mock).mockResolvedValue({
          name: 'Test scheme name',
        });
        (getCompletedSubmissionExportList as jest.Mock).mockResolvedValue(
          submissionList
        );
      });

      it('Should redirect to an error page if getGrantScheme throws an error', async () => {
        (getGrantScheme as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to view submission applications.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to an error page if getCompletedSubmissionExportList throws an error', async () => {
        (getCompletedSubmissionExportList as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to view submission applications.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to an error page if submissionList has no entries', async () => {
        (getCompletedSubmissionExportList as jest.Mock).mockResolvedValue([]);

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"There are no submissions available for download.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should return form action', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.formAction).toStrictEqual(
          process.env.SUB_PATH + '/testResolvedURL'
        );
      });

      it('Should return scheme name', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.schemeName).toStrictEqual('Test scheme name');
      });

      it('Should return submission list', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.submissionList).toStrictEqual([
          { label: 'some name', url: '#1' },
          { label: 'some other name', url: '#2' },
          { label: 'some third name', url: '#3' },
        ]);
      });

      it('Should return csrf token', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.csrfToken).toStrictEqual('testCSRFToken');
      });
    });

    describe('There are completed submissions', () => {
      describe('Browser JavaScript enabled', () => {
        describe('Checkboxes', () => {
          it('Should check the individual checkbox when it is clicked', () => {
            render(component);
            const checkbox = screen.getByRole('checkbox', {
              name: submissionList[0].label,
            });

            checkbox.click();

            expect(checkbox).toBeChecked();
          });

          it('Should check all the checkboxes when "Select all" checkbox is clicked', () => {
            render(component);
            const selectAll = screen.getByRole('checkbox', {
              name: 'Select all',
            });

            selectAll.click();

            expect(selectAll).toBeChecked();
            expect(
              screen.getByRole('checkbox', { name: submissionList[0].label })
            ).toBeChecked();
            expect(
              screen.getByRole('checkbox', { name: submissionList[1].label })
            ).toBeChecked();
            expect(
              screen.getByRole('checkbox', { name: submissionList[2].label })
            ).toBeChecked();
          });

          it('Should uncheck all the boxes when "Select all" checkbox is unchecked', () => {
            render(component);
            const selectAll = screen.getByRole('checkbox', {
              name: 'Select all',
            });
            const checkbox1 = screen.getByRole('checkbox', {
              name: submissionList[0].label,
            });

            checkbox1.click();
            selectAll.click();
            selectAll.click();

            expect(selectAll).not.toBeChecked();
            expect(checkbox1).not.toBeChecked();
            expect(
              screen.getByRole('checkbox', { name: submissionList[1].label })
            ).not.toBeChecked();
            expect(
              screen.getByRole('checkbox', { name: submissionList[2].label })
            ).not.toBeChecked();
          });
        });

        describe('File download', () => {
          it('Should download the all files for checked checkboxes when "Download selected" button is clicked', () => {
            render(component);
            const checkbox1 = screen.getByRole('checkbox', {
              name: submissionList[0].label,
            });
            const checkbox2 = screen.getByRole('checkbox', {
              name: submissionList[1].label,
            });
            const downloadSelected = screen.getByRole('button', {
              name: 'Download selected',
            });

            checkbox1.click();
            checkbox2.click();
            downloadSelected.click();

            // We know that the timeout is 100ms per file download.
            setTimeout(() => {
              expect(downloadFile).toHaveBeenCalledTimes(2);
            }, 200);
          });
        });
      });
    });
  });
});
