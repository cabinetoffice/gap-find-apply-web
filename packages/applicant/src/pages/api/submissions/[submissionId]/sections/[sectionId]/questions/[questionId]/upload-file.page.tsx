import { IncomingForm } from 'formidable';
import fs from 'fs';
import { ValidationError } from 'gap-web-ui';
import {
  getNextNavigation,
  getQuestionById,
  postDocumentResponse,
  PostQuestionResponse,
  QuestionNavigation,
} from '../../../../../../../../services/SubmissionService';
import { MAX_FILE_UPLOAD_SIZE_BYTES } from '../../../../../../../../utils/constants';
import { getJwtFromCookies } from '../../../../../../../../utils/jwt';
import { routes } from '../../../../../../../../utils/routes';

export const config = {
  api: {
    bodyParser: false,
  },
};

function nonMandatoryQuestionHasEmptyAnswer(question, formData) {
  const isMandatory = question.question.validation.mandatory;
  const fileIsEmpty = formData.files.attachment?.originalFilename === '';
  return !isMandatory && fileIsEmpty;
}

function nextNavigation(
  response: QuestionNavigation,
  submissionId: string,
  sectionId: string
): string {
  return !response?.sectionList
    ? routes.submissions.question(submissionId, sectionId, response.questionId)
    : routes.submissions.section(submissionId, sectionId);
}

function urlValidationFailureParams(
  errors: ValidationError[],
  questionId: string
): string {
  return errors
    .map(
      (error: ValidationError) =>
        '?errors[]=' +
        JSON.stringify({
          fieldName: questionId,
          errorMessage: error.errorMessage,
        })
    )
    .join('');
}

const getFileFromRequest = async (req) => {
  return await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: MAX_FILE_UPLOAD_SIZE_BYTES });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

const postDocumentUploadResponse = async (
  submissionId: string,
  sectionId: string,
  questionId: string,
  fileData,
  jwt
) => {
  const file = fs.createReadStream(fileData.files.attachment.filepath);

  const response: PostQuestionResponse = await postDocumentResponse(
    submissionId,
    sectionId,
    questionId,
    file,
    fileData.files.attachment.originalFilename,
    jwt
  );
  return response;
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const submissionId = req.query.submissionId.toString();
    const sectionId = req.query.sectionId.toString();
    const questionId = req.query.questionId.toString();
    const jwt = getJwtFromCookies(req);
    const formData = await getFileFromRequest(req);

    //form data will contains files.attachment.originalFilename only when the user has just uploaded a file
    //if the user has already uploaded an attachment previously,and press Save and continue on the question page,
    // the formData will not contain files.attachment.originalFilename
    if (formData.files?.attachment?.originalFilename !== undefined) {
      formData.files.attachment.originalFilename = sanitizeFileName(
        formData.files.attachment.originalFilename
      );
    }

    const questionData = await getQuestionById(
      submissionId,
      sectionId,
      questionId,
      jwt
    );
    const referer: string = req?.headers?.referer;
    //checks that the request is coming from the Check your answer page
    const isFromCYAPage =
      referer.includes('fromCYAPage=true') ||
      referer === routes.submissions.section(submissionId, sectionId) ||
      formData.fields?.hasOwnProperty('isRefererCheckYourAnswerScreen');

    const isCancel = formData.fields?.hasOwnProperty('cancel');
    //we want to make sure that there is a response to the question,
    //otherwise user could avoid answering this question
    if (isCancel && questionData.question.response) {
      return res.redirect(
        302,
        `${process.env.HOST}${routes.submissions.section(
          submissionId,
          sectionId
        )}`
      );
    }
    const isSaveAndExit = formData.fields?.hasOwnProperty('save-and-exit');

    // if there is no attachment submitted with the form then the user came from the existing file screen
    const userComingFromExistingFilePage = !formData.files.attachment;

    // if the attachment name is empty then the user has not uploaded anything
    const isEmptyAndNotMandatory = nonMandatoryQuestionHasEmptyAnswer(
      questionData,
      formData
    );

    if (userComingFromExistingFilePage || isEmptyAndNotMandatory) {
      const nextNavParams = await getNextNavigation(
        submissionId,
        sectionId,
        questionId,
        isSaveAndExit,
        jwt
      );

      const redirectUrl = isFromCYAPage
        ? routes.submissions.section(submissionId, sectionId)
        : nextNavigation(nextNavParams.nextNavigation, submissionId, sectionId);

      return res.redirect(302, `${process.env.HOST}${redirectUrl}`);
    }

    try {
      const response = await postDocumentUploadResponse(
        submissionId,
        sectionId,
        questionId,
        formData,
        jwt
      );
      let redirectLocation = response.nextNavigation;

      if (isSaveAndExit) {
        const data = await getNextNavigation(
          submissionId,
          sectionId,
          questionId,
          true,
          jwt
        );
        redirectLocation = data.nextNavigation;
      }

      const redirectUrl = isFromCYAPage
        ? routes.submissions.section(submissionId, sectionId)
        : nextNavigation(redirectLocation, submissionId, sectionId);
      return res.redirect(302, `${process.env.HOST}${redirectUrl}`);
    } catch (err: any) {
      if (err.response?.data) {
        const { errors } = err.response.data;
        const errorStr = urlValidationFailureParams(errors, questionId);

        return res.redirect(
          302,
          `${process.env.HOST}${routes.submissions.question(
            submissionId,
            sectionId,
            questionId
          )}${errorStr}${isFromCYAPage ? '&fromCYAPage=true' : ''}`
        );
      }

      // if something isn't a validation failure it's probably worth logging
      console.error(err);
    }
  } else {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
};

const sanitizeFileName = (fileName: string) => {
  const regex = /[^a-zA-Z0-9()_,.-]/g;
  return fileName.replace(regex, '_');
};

export default handler;
