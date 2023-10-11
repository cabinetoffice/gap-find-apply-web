import {
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import { SaveAndCancel } from '../../../components/save-and-cancel/SaveAndCancel';
import {
  GrantMandatoryQuestionDto,
  getMandatoryQuestionById,
  updateMandatoryQuestion,
} from '../../../services/GrantMandatoryQuestionService';
import { Optional } from '../../../testUtils/unitTestHelpers';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';

export const getServerSideProps = async ({
  req,
  res,
  query,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const mandatoryQuestionId = (query?.mandatoryQuestionId as string) || null;
  const fromSummary = (query?.fromSummary as string) || null;
  const jwt = getJwtFromCookies(req);
  const mandatoryQuestion = await getMandatoryQuestionById(
    jwt,
    mandatoryQuestionId
  );
  if (!mandatoryQuestion) {
    return {
      redirect: {
        destination: 404,
        permanent: false,
      },
    };
  }
  //TODO change this to be false. only when someone access this from the summary page,
  //  we want to show the default value
  //otherwise we gonna send it to the next non filled page

  if (mandatoryQuestion?.name !== null && fromSummary === 'true') {
    return {
      redirect: {
        destination: routes.mandatoryQuestions.addressPage(mandatoryQuestionId),
        permanent: false,
      },
    };
  }

  const response = await callServiceMethod(
    req,
    res,
    (body) => updateMandatoryQuestion(jwt, mandatoryQuestionId, body),
    routes.mandatoryQuestions.startPage(mandatoryQuestion.schemeId.toString()),
    {
      errorInformation:
        'Something went wrong while trying to update your organisation details',
      linkAttributes: {
        href: resolvedUrl,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    }
  );

  if ('redirect' in response) {
    return response;
  }

  let defaultFields =
    (mandatoryQuestion.name as Optional<GrantMandatoryQuestionDto>) || '';
  let fieldErrors = [] as ValidationError[];
  if ('fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    defaultFields = response.body as Optional<GrantMandatoryQuestionDto>;
  }
  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      csrfToken: (req as any).csrfToken?.() || '',
      formAction: publicRuntimeConfig.subPath + resolvedUrl,
      fieldErrors,
      defaultFields,
    },
  };
};
const MandatoryQuestionOrganisationNamePage = ({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
}) => {
  return (
    <>
      <>
        <Meta
          title={`${
            fieldErrors.length > 0 ? 'Error: ' : ''
          }Organisation name - Apply for a grant`}
        />

        <Layout backBtnUrl={routes.organisation.index}>
          <FlexibleQuestionPageLayout
            formAction={formAction}
            fieldErrors={fieldErrors}
            csrfToken={csrfToken}
          >
            <TextInput
              questionTitle="Enter the name of your organisation"
              questionHintText="This is the official name of your organisation. It could be the name that is registered with Companies House or the Charity Commission"
              fieldName="name"
              defaultValue={defaultFields.name || ''}
              fieldErrors={fieldErrors}
              width="30"
            />

            <SaveAndCancel
              type={ButtonTypePropertyEnum.Submit}
              saveButton={{
                name: 'Save and continue',
              }}
            />
          </FlexibleQuestionPageLayout>
        </Layout>
      </>
    </>
  );
};

export default MandatoryQuestionOrganisationNamePage;
