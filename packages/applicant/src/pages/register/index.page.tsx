import {
  Button,
  Checkboxes,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Link from 'next/link';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import callServiceMethod from '../../utils/callServiceMethod';
import { routes } from '../../utils/routes';

const { publicRuntimeConfig } = getConfig();

export interface RegisterAnApplicant {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: string;
  telephone: string;
  privacyPolicy?: string;
}

interface RegisterPageProps {
  fieldErrors: ValidationError[];
  invalidData?: RegisterAnApplicant;
  loginUrl: string;
  csrfToken: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let fieldErrors = [] as ValidationError[];
  let invalidData = null as RegisterAnApplicant;

  const grantApplicantService = GrantApplicantService.getInstance();
  const response = await callServiceMethod(
    req,
    res,
    (body: RegisterAnApplicant) =>
      grantApplicantService.registerAnApplicant(body),
    routes.register.confirmation,
    {
      errorInformation:
        'Something went wrong while trying to register an applicant',
      linkAttributes: {
        href: '/register',
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    }
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    invalidData = response.body;
  }

  return {
    props: {
      fieldErrors: fieldErrors,
      invalidData: invalidData,
      loginUrl: process.env.COLA_URL,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

export default function RegisterPage({
  fieldErrors,
  invalidData,
  loginUrl,
  csrfToken,
}: RegisterPageProps) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Register to apply - Apply for a grant`}
      />

      <Layout backBtnUrl="/" isUserLoggedIn={false}>
        <FlexibleQuestionPageLayout
          formAction={publicRuntimeConfig.subPath + routes.register.index}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <section>
            <h1 className="govuk-heading-l" data-cy="cy-registration-header">
              Sign in or create an account to apply
            </h1>
            <p className="govuk-body">Already have an account?</p>
            <Link href={loginUrl}>
              <a
                role="button"
                draggable="false"
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cy-sign-in-link"
              >
                Sign in
              </a>
            </Link>
          </section>

          <section className="govuk-!-margin-top-5">
            <h2 className="govuk-heading-m" data-cy="cy-registration-subheader">
              Create an account
            </h2>
            <p className="govuk-body" data-cy="cy-registration-description">
              Enter your details below to create an account and apply for a
              grant.
            </p>

            <TextInput
              questionTitle="First name"
              titleSize="s"
              fieldName="firstName"
              fieldErrors={fieldErrors}
              defaultValue={invalidData ? invalidData.firstName : ''}
            />

            <TextInput
              questionTitle="Last name"
              titleSize="s"
              fieldName="lastName"
              fieldErrors={fieldErrors}
              defaultValue={invalidData ? invalidData.lastName : ''}
            />

            <TextInput
              questionTitle="Enter your email address"
              titleSize="s"
              fieldName="email"
              fieldErrors={fieldErrors}
              questionHintText="You will use this email address every time you sign in."
              textInputSubtype="email"
              defaultValue={invalidData ? invalidData.email : ''}
            />

            <TextInput
              questionTitle="Confirm your email address"
              titleSize="s"
              fieldName="emailConfirmed"
              fieldErrors={fieldErrors}
              textInputSubtype="email"
              defaultValue={invalidData ? invalidData.emailConfirmed : ''}
            />

            <TextInput
              questionTitle="UK telephone number (mobile)"
              titleSize="s"
              fieldName="telephone"
              fieldErrors={fieldErrors}
              defaultValue={invalidData ? invalidData.telephone : ''}
              questionHintText={
                <>
                  <p>
                    You must enter a UK mobile telephone number to continue.
                  </p>
                  <p>
                    We will send a verification code to this number every time
                    you sign in.
                  </p>
                </>
              }
            />

            <Checkboxes
              questionTitle=""
              options={[
                {
                  label: (
                    <>
                      I have read and agree to the{' '}
                      <a
                        className="govuk-link"
                        href="https://www.find-government-grants.service.gov.uk/info/privacy"
                        target="_blank"
                        rel="noreferrer"
                        data-cy="cy-privacy-policy-link"
                      >
                        Privacy policy
                      </a>
                    </>
                  ),
                  value: 'agreed',
                },
              ]}
              defaultCheckboxes={[invalidData?.privacyPolicy ? 'agreed' : '']}
              fieldName="privacyPolicy"
              fieldErrors={fieldErrors}
            />

            <Button
              text="Save and continue"
              isSecondary={false}
              type={ButtonTypePropertyEnum.Submit}
            />
          </section>
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
