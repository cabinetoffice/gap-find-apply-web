import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { parseBody } from 'next/dist/server/api-utils/node';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { createMockRouter } from '../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../types/NextGetServerSidePropsResponse';
import { routes } from '../../utils/routes';
import {
  getServerSideProps,
  RegisterAnApplicant,
} from '../register/index.page';
import RegisterPage from './index.page';

jest.mock('../../utils/csrf');
jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});

jest.mock('next/dist/server/api-utils/node');

afterEach(() => {
  jest.resetAllMocks();
});

const context = {
  req: {
    method: 'POST',
    body: {
      email: 'email@test.com',
      emailConfirmed: 'email@test.com',
      firstName: 'Jane',
      lastName: 'Doe',
      telephone: '00000000000',
    },
    csrfToken: () => 'testCSRFToken',
  },
  res: {},
} as any;

const contextNoToken = {
  req: {
    method: 'POST',
    csrfToken: () => '',
  },
  res: {},
} as any;

const registrationData = {
  email: 'email@test.com',
  emailConfirmed: 'email@test.com',
  firstName: 'Jane',
  lastName: 'Doe',
  telephone: '00000000000',
} as RegisterAnApplicant;

const validationErrors = [
  {
    fieldName: 'firstName',
    message: 'enter a first name',
  },
];

const invalidData = {
  firstName: 'John',
};
const loginUrl = 'https://login.com';

describe('getServerSideProps', () => {
  beforeEach(() => {
    process.env.COLA_URL = 'https://test.url/some/path';
  });
  it('Should redirect to the dashboard if there are no errors', async () => {
    const spy = jest
      .spyOn(GrantApplicantService.prototype, 'registerAnApplicant')
      .mockResolvedValueOnce(Promise.resolve);

    (parseBody as jest.Mock).mockResolvedValue(registrationData);

    const response = await getServerSideProps(context);

    expect(spy).toHaveBeenCalledWith(registrationData);
    expect(response).toEqual({
      redirect: {
        destination: routes.register.confirmation,
        statusCode: 302,
      },
    });
  });

  it('should return error params if there are errors', async () => {
    const expectedError = {
      response: {
        data: {
          responseAccepted: false,
          message: 'Validation failure',
          errors: validationErrors,
          invalidData: invalidData,
          loginUrl: 'https://test.url/some/path',
        },
      },
    };

    const spy = jest
      .spyOn(GrantApplicantService.prototype, 'registerAnApplicant')
      .mockRejectedValue(expectedError);

    (parseBody as jest.Mock).mockResolvedValue(registrationData);

    const response = (await getServerSideProps(
      contextNoToken
    )) as NextGetServerSidePropsResponse;

    expect(spy).toHaveBeenCalledWith(registrationData);
    expect(response.props.fieldErrors).toEqual(validationErrors);
    expect(response.props.invalidData).toEqual(registrationData);
    expect(response.props.loginUrl).toEqual('https://test.url/some/path');
  });
});

describe('The register page ', () => {
  it('should render the register components correctly', () => {
    const loginUrl = 'https://login.com';
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.register.index,
        })}
      >
        <RegisterPage
          fieldErrors={[]}
          invalidData={null}
          loginUrl={loginUrl}
          csrfToken="testCSRFToken"
        />
      </RouterContext.Provider>
    );

    expect(
      screen.getByText('Sign in or create an account to apply')
    ).toBeDefined();

    expect(screen.getByText('Already have an account?')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveProperty(
      'href',
      'https://login.com/'
    );
    expect(
      screen.getByRole('button', { name: 'Save and continue' })
    ).toHaveAttribute('type', 'submit');
    expect(
      screen.getByRole('heading', { name: 'Create an account' })
    ).toHaveTextContent('Create an account');
    expect(screen.getByRole('textbox', { name: 'First name' })).toBeDefined();
    expect(screen.getByRole('textbox', { name: 'Last name' })).toBeDefined();
    expect(
      screen.getByRole('textbox', { name: 'Enter your email address' })
    ).toBeDefined();
    expect(
      screen.getByRole('textbox', { name: 'Confirm your email address' })
    ).toBeDefined();
    expect(
      screen.getByRole('textbox', { name: 'UK telephone number (mobile)' })
    ).toBeDefined();
    expect(document.getElementById('privacyPolicy')).toBeDefined();
  });

  it('should render error messages correctly', () => {
    const errors = [
      {
        fieldName: 'firstName',
        errorMessage: 'Enter a first name',
      },
      {
        fieldName: 'lastName',
        errorMessage: 'Enter a last name',
      },
      {
        fieldName: 'email',
        errorMessage: 'Enter an email',
      },
      {
        fieldName: 'emailConfirmed',
        errorMessage: 'Enter an email',
      },
      {
        fieldName: 'telephone',
        errorMessage: 'Enter a telephone number',
      },
      {
        fieldName: 'privacyPolicy',
        errorMessage:
          'You must confirm that you have read and agreed to the privacy policy',
      },
    ];

    const invalidData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@test.com',
      emailConfirmed: 'jane.doe@test.com',
      telephone: '00000000000',
      privacyPolicy: '',
    };
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.register.index,
        })}
      >
        <RegisterPage
          fieldErrors={errors}
          invalidData={invalidData}
          loginUrl={loginUrl}
          csrfToken="testCSRFToken"
        />
      </RouterContext.Provider>
    );

    // error banner
    expect(
      screen.getByRole('link', { name: 'Enter a first name' })
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Enter a last name' })
    ).toBeDefined();
    expect(
      screen.getAllByRole('link', { name: 'Enter an email' })
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Enter a telephone number' })
    ).toBeDefined();

    // first name field errors
    expect(document.getElementById('firstName-error')).toBeDefined();
    expect(document.getElementById('firstName-error')).toHaveTextContent(
      'Enter a first name'
    );
    expect(screen.getByRole('textbox', { name: 'First name' })).toHaveClass(
      'govuk-input--error'
    );
    expect(screen.getByRole('textbox', { name: 'First name' })).toHaveValue(
      'Jane'
    );

    // last name field errors
    expect(document.getElementById('lastName-error')).toBeDefined();
    expect(document.getElementById('lastName-error')).toHaveTextContent(
      'Enter a last name'
    );
    expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveClass(
      'govuk-input--error'
    );
    expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveValue(
      'Doe'
    );

    // email field errors
    expect(document.getElementById('email-error')).toBeDefined();
    expect(document.getElementById('email-error')).toHaveTextContent(
      'Enter an email'
    );
    expect(
      screen.getByRole('textbox', { name: 'Enter your email address' })
    ).toHaveClass('govuk-input--error');
    expect(
      screen.getByRole('textbox', { name: 'Enter your email address' })
    ).toHaveValue('jane.doe@test.com');

    // confirm email field errors
    expect(document.getElementById('emailConfirmed-error')).toBeDefined();
    expect(document.getElementById('emailConfirmed-error')).toHaveTextContent(
      'Enter an email'
    );
    expect(
      screen.getByRole('textbox', { name: 'Confirm your email address' })
    ).toHaveClass('govuk-input--error');
    expect(
      screen.getByRole('textbox', { name: 'Confirm your email address' })
    ).toHaveValue('jane.doe@test.com');

    // telephone field errors
    expect(document.getElementById('telephone-error')).toBeDefined();
    expect(document.getElementById('telephone-error')).toHaveTextContent(
      'Enter a telephone number'
    );
    expect(
      screen.getByRole('textbox', { name: 'UK telephone number (mobile)' })
    ).toHaveClass('govuk-input--error');
    expect(
      screen.getByRole('textbox', { name: 'UK telephone number (mobile)' })
    ).toHaveValue('00000000000');

    // privacy policy field errors
    expect(document.getElementById('privacyPolicy-error')).toBeDefined();
    expect(document.getElementById('privacyPolicy-error')).toHaveTextContent(
      'Error: You must confirm that you have read and agreed to the privacy policy'
    );
    expect(screen.getByTestId('checkbox-component')).toHaveClass(
      'govuk-form-group--error'
    );
    expect(document.getElementById('privacyPolicy')).not.toBeChecked();
  });

  it('should check textbox if applicant has agreed to privacy policy', () => {
    const invalidData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@test.com',
      emailConfirmed: 'jane.doe@test.com',
      telephone: '00000000000',
      privacyPolicy: 'agreed',
    };
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.register.index,
        })}
      >
        <RegisterPage
          fieldErrors={[]}
          invalidData={invalidData}
          loginUrl={loginUrl}
          csrfToken="testCSRFToken"
        />
      </RouterContext.Provider>
    );
    expect(document.getElementById('privacyPolicy')).toBeChecked();
  });
});
