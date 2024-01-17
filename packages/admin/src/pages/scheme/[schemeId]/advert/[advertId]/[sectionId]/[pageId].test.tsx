import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import InferProps from '../../../../../../types/InferProps';
import { getPageProps } from '../../../../../../testUtils/unitTestHelpers';
import Page, { getServerSideProps, removePTag } from './[pageId].page';

jest.mock('next/router', () => ({
  useRouter: () => ({ basePath: '/apply/admin' }),
}));

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  advertId: 'testAdvertId',
  csrfToken: 'testCSRFToken',
  fieldErrors: [],
  nextPageId: 'testNextPageId',
  pageTitle: 'testPageTitle',
  previousPageId: 'testPreviousPageId',
  formAction: '/testResolvedURL',
  questions: [
    {
      questionId: '1',
      responseType: 'INTEGER',
      questionTitle: 'questionTitle',
      hintText: 'hintText',
      options: [],
      response: {
        id: '1',
        seen: true,
        response: 'dummyResponse',
        multiResponse: [],
      },
    },
  ],
  schemeId: 'testSchemeId',
  sectionName: 'testSectionName',
  status: 'NOT_STARTED',
  previousValues: null,
  pageId: 'testPageId',
});

describe('The advert question page', () => {
  describe('Advert question page components', () => {
    it('Should render a back button', () => {
      render(<Page {...getPageProps(getDefaultProps)} />);

      screen.getByRole('link', { name: 'Back' });
    });

    it('Should render a heading if there are two or more questions', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              {
                questionId: '1',
                responseType: 'INTEGER',
                questionTitle: 'questionTitle',
                hintText: 'hintText',
                options: [],
                response: {
                  id: '1',
                  seen: true,
                  response: 'dummyResponse',
                  multiResponse: [],
                },
              },
              {
                questionId: '2',
                responseType: 'INTEGER',
                questionTitle: 'questionTitle2',
                hintText: 'hintText2',
                options: [],
                response: {
                  id: '2',
                  seen: true,
                  response: 'dummyResponse2',
                  multiResponse: [],
                },
              },
            ],
          })}
        />
      );

      screen.getByRole('heading', { name: 'testPageTitle', level: 1 });
      screen.getByRole('heading', { name: 'questionTitle', level: 2 });
      screen.getByRole('heading', { name: 'questionTitle2', level: 2 });
    });

    it('Should render a heading if there is one question', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'LONG_TEXT' }],
          })}
        />
      );

      screen.getByRole('heading', { name: 'questionTitle', level: 1 });
    });

    it('Should render a radio input for if the questions complete or not', () => {
      render(<Page {...getPageProps(getDefaultProps)} />);

      screen.getByRole('heading', {
        name: 'Have you completed this question?',
        level: 2,
      });
      screen.getByRole('radio', { name: "Yes, I've completed this question" });
      screen.getByRole('radio', { name: "No, I'll come back later" });
    });

    it('Should default the radio input to neither option', () => {
      render(<Page {...getPageProps(getDefaultProps)} />);

      expect(
        screen.getByRole('radio', { name: "No, I'll come back later" })
      ).not.toBeChecked();
      expect(
        screen.getByRole('radio', { name: "Yes, I've completed this question" })
      ).not.toBeChecked();
    });

    it('Should set the radio input to yes based on the previous values, CASE 1', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            previousValues: { completed: 'Yes' },
          })}
        />
      );

      expect(
        screen.getByRole('radio', { name: "Yes, I've completed this question" })
      ).toBeChecked();
      expect(
        screen.getByRole('radio', { name: "No, I'll come back later" })
      ).not.toBeChecked();
    });

    it('Should set the radio input to yes based on the previous values, CASE 2', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            previousValues: { completed: 'No' },
          })}
        />
      );

      expect(
        screen.getByRole('radio', { name: "No, I'll come back later" })
      ).toBeChecked();
      expect(
        screen.getByRole('radio', { name: "Yes, I've completed this question" })
      ).not.toBeChecked();
    });

    it('Should set the radio input to yes based on the previous values, CASE 3', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            previousValues: { completed: 'MAYBE?' },
          })}
        />
      );

      expect(
        screen.getByRole('radio', { name: "No, I'll come back later" })
      ).not.toBeChecked();
      expect(
        screen.getByRole('radio', { name: "Yes, I've completed this question" })
      ).not.toBeChecked();
    });

    it('Should render a save and continue button', () => {
      render(<Page {...getPageProps(getDefaultProps)} />);

      screen.getByRole('button', { name: 'Save and continue' });
    });

    it('Should render a save an exit button', () => {
      render(<Page {...getPageProps(getDefaultProps)} />);

      screen.getByRole('button', { name: 'Save and exit' });
    });
  });

  describe('Advert question page with INTEGER response type', () => {
    it('Should render the text input component', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'INTEGER' }],
          })}
        />
      );
      screen.getByTestId('input-field');
    });

    it('Should render an empty string as a default value when no default value provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'INTEGER', response: null }],
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('');
    });

    it('Should render question response when no previous value is provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              { responseType: 'INTEGER', response: { response: '123456' } },
            ],
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('123456');
    });

    it('Should render previous value even if question response is provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              { responseType: 'INTEGER', response: { response: '123456' } },
            ],
            previousValues: { '1': '876543' },
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('876543');
    });
  });

  describe('Advert question page with CURRENCY response type', () => {
    it('Should render the text input component', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'CURRENCY' }],
          })}
        />
      );
      screen.getByTestId('input-field');
    });

    it('Should render an empty string as a default value when no default value provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'CURRENCY', response: null }],
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('');
    });

    it('Should render question response when no previous value is provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              { responseType: 'CURRENCY', response: { response: '123456' } },
            ],
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('123456');
    });

    it('Should render previous value even if question response is provided', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              { responseType: 'CURRENCY', response: { response: '123456' } },
            ],
            previousValues: { '1': '876543' },
          })}
        />
      );
      expect(screen.getByTestId('input-field')).toHaveValue('876543');
    });
  });

  describe('Advert question page with DATE response type', () => {
    describe('Date', () => {
      it('Should render the date components', () => {
        render(
          <Page
            {...getPageProps(getDefaultProps, {
              questions: [{ responseType: 'DATE' }],
            })}
          />
        );
        screen.getByTestId('dateGroupDiv');
      });

      it('Should render an empty string as a default value when no default value provided', () => {
        render(
          <Page
            {...getPageProps(getDefaultProps, {
              questions: [{ responseType: 'DATE', response: null }],
            })}
          />
        );
        expect(screen.getByRole('textbox', { name: 'Day' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Month' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Year' })).toHaveValue('');
      });

      it('Should render question response when no previous value is provided', () => {
        render(
          <Page
            {...getPageProps(getDefaultProps, {
              questions: [
                {
                  responseType: 'DATE',
                  response: { multiResponse: ['28', '04', '2022'] },
                },
              ],
            })}
          />
        );
        expect(screen.getByRole('textbox', { name: 'Day' })).toHaveValue('28');
        expect(screen.getByRole('textbox', { name: 'Month' })).toHaveValue(
          '04'
        );
        expect(screen.getByRole('textbox', { name: 'Year' })).toHaveValue(
          '2022'
        );
      });

      it('Should render previous value even if question response is provided', () => {
        render(
          <Page
            {...getPageProps(getDefaultProps, {
              questions: [
                {
                  responseType: 'DATE',
                  response: { multiResponse: ['28', '04', '2022'] },
                },
              ],
              previousValues: {
                '1-day': '29',
                '1-month': '05',
                '1-year': '2023',
              },
            })}
          />
        );
        expect(screen.getByRole('textbox', { name: 'Day' })).toHaveValue('29');
        expect(screen.getByRole('textbox', { name: 'Month' })).toHaveValue(
          '05'
        );
        expect(screen.getByRole('textbox', { name: 'Year' })).toHaveValue(
          '2023'
        );
      });
    });
  });

  describe('Advert question page with Short Text response type', () => {
    it('Should render the text input component', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'SHORT_TEXT' }],
          })}
        />
      );
      screen.getByTestId('input-field');
    });

    it('Should render previous values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'SHORT_TEXT' }],
          })}
        />
      );
      const shortTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(shortTextQuestion).toHaveValue('dummyResponse');
    });

    it('Should not render values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'SHORT_TEXT', response: null }],
          })}
        />
      );
      const shortTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(shortTextQuestion).toHaveValue('');
    });

    it('Should render previous value after an error', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'SHORT_TEXT' }],
            previousValues: { '1': 'dummyPreviousResponse' },
          })}
        />
      );
      const shortTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(shortTextQuestion).toHaveValue('dummyPreviousResponse');
    });
  });

  describe('Advert question page with Long Text response type', () => {
    it('Should render the text input component', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'LONG_TEXT' }],
          })}
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'questionTitle' });
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('Should render previous values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'LONG_TEXT' }],
          })}
        />
      );
      const longTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(longTextQuestion).toHaveValue('dummyResponse');
    });

    it('Should not render values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'LONG_TEXT', response: null }],
          })}
        />
      );
      const longTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(longTextQuestion).toHaveValue('');
    });

    it('Should render previous value after an error', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [{ responseType: 'LONG_TEXT' }],
            previousValues: { '1': 'dummyPreviousResponse' },
          })}
        />
      );
      const longTextQuestion = screen.getByRole('textbox', {
        name: 'questionTitle',
      });
      expect(longTextQuestion).toHaveValue('dummyPreviousResponse');
    });
  });

  describe('Advert question page with List response type', () => {
    it('Should render the text input component', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              {
                responseType: 'LIST',
                options: ['option 1', 'options ', 'option 3'],
              },
            ],
          })}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('Should render previous values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              {
                responseType: 'LIST',
                options: ['option 1', 'options ', 'option 3'],
                response: {
                  response: undefined,
                  multiResponse: ['option 1'],
                },
              },
            ],
          })}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });

    it('Should not render previous values', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              {
                responseType: 'LIST',
                options: ['option 1', 'options ', 'option 3'],
                response: {
                  response: undefined,
                  multiResponse: [],
                },
              },
            ],
          })}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });

    it('Should render previous value after an error', () => {
      render(
        <Page
          {...getPageProps(getDefaultProps, {
            questions: [
              {
                responseType: 'LIST',
                options: ['option 1', 'options ', 'option 3'],
              },
            ],
            previousValues: { '1': ['option 3'] },
          })}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });
  });
});
describe('Advert question page with RichText response type', () => {
  it('Should render the RichText component', () => {
    render(
      <Page
        {...getPageProps(getDefaultProps, {
          questions: [{ responseType: 'RICH_TEXT' }],
        })}
      />
    );
    screen.getByTestId('rich-text-component');
  });
});

describe('remove P tag', () => {
  it('shall remove the opening and closing p tag from a string', () => {
    const string = '<p>BLA BLA</p>';
    expect(removePTag(string)).toBe('BLA BLA');
  });
});
