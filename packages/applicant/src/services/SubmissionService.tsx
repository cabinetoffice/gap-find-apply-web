import axios from 'axios';
import FormData from 'form-data';
import { ValidationError } from 'gap-web-ui';
import getConfig from 'next/config';
import { MAX_FILE_UPLOAD_SIZE_BYTES } from '../utils/constants';
import { axiosConfig } from '../utils/jwt';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function getSubmissionById(
  submissionId: string,
  jwt: string
): Promise<ApplicationDetailsInterface> {
  const { data } = await axios.get<ApplicationDetailsInterface>(
    `${BACKEND_HOST}/submissions/${submissionId}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function getSectionById(
  submissionId: string,
  sectionId: string,
  jwt: string
): Promise<SectionData> {
  const { data } = await axios.get<SectionData>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function postHasSectionBeenCompleted(
  submissionId: string,
  sectionId: string,
  body: SectionReviewBody,
  jwt: string
) {
  const { data } = await axios.post<PostQuestionResponse>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/review`,
    body,
    axiosConfig(jwt)
  );
  return data;
}

export async function getQuestionById(
  submissionId: string,
  sectionId: string,
  questionId: string,
  jwt: string
): Promise<QuestionData> {
  const { data } = await axios.get<QuestionData>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function postQuestionResponse(
  submissionId: string,
  sectionId: string,
  questionId: string,
  body: QuestionPostBody,
  jwt: string
) {
  const { data } = await axios.post<PostQuestionResponse>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
    body,
    axiosConfig(jwt)
  );
  return data;
}

export async function postDocumentResponse(
  submissionId: string,
  sectionId: string,
  questionId: string,
  file,
  filename: string,
  jwt: string
) {
  const formData = new FormData();
  formData.append('attachment', file, { filename });

  const response = await axios.post<PostQuestionResponse>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/attach`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        ...formData.getHeaders(),
      },
      maxContentLength: MAX_FILE_UPLOAD_SIZE_BYTES,
      maxBodyLength: MAX_FILE_UPLOAD_SIZE_BYTES,
    }
  );
  return response.data;
}

export async function createSubmission(applicationId: string, jwt: string) {
  const { data } = await axios.post<CreateSubmissionResponse>(
    `${BACKEND_HOST}/submissions/createSubmission/${applicationId}`,
    null,
    axiosConfig(jwt)
  );

  return data;
}

export async function isSubmissionReady(
  submissionId: string,
  jwt: string
): Promise<boolean> {
  const { data } = await axios.get<boolean>(
    `${BACKEND_HOST}/submissions/${submissionId}/ready`,
    axiosConfig(jwt)
  );
  return data;
}

export async function submit(
  submissionId: string,
  jwt: string
): Promise<string> {
  const { data } = await axios.post<string>(
    `${BACKEND_HOST}/submissions/submit`,
    {
      submissionId,
    },
    axiosConfig(jwt)
  );
  return data;
}

export async function hasSubmissionBeenSubmitted(
  submissionId: string,
  jwt: string
): Promise<boolean> {
  const { data } = await axios.get<boolean>(
    `${BACKEND_HOST}/submissions/${submissionId}/isSubmitted`,
    axiosConfig(jwt)
  );
  return data;
}

export async function deleteAttachmentByQuestionId(
  submissionId: string,
  sectionId: string,
  questionId: string,
  attachmentId: string,
  jwt: string
): Promise<QuestionData> {
  const { data } = await axios.delete<QuestionData>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/attachments/${attachmentId}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function getNextNavigation(
  submissionId: string,
  sectionId: string,
  questionId: string,
  saveAndExit: boolean,
  jwt: string
): Promise<NextNavigation> {
  const { data } = await axios.get<NextNavigation>(
    `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/next-navigation${
      saveAndExit ? '?saveAndExit=true' : ''
    }`,
    axiosConfig(jwt)
  );
  return data;
}

export async function downloadSummary(submissionId, jwt) {
  return await axios.get(
    `${BACKEND_HOST}/submissions/${submissionId}/download-summary`,
    axiosConfig(jwt)
  );
}

export async function isApplicantEligible(
  submissionId: string,
  jwt: string
): Promise<boolean> {
  const { data } = await axios.get<boolean>(
    `${BACKEND_HOST}/submissions/${submissionId}/isApplicantEligible`,
    axiosConfig(jwt)
  );
  return data;
}

export interface SectionReviewBody {
  isComplete: boolean;
}

export interface CreateSubmissionResponse {
  submissionCreated: boolean;
  submissionId: string;
  message?: string;
}

export type PostQuestionResponse = {
  responseAccepted: boolean;
  nextNavigation?: QuestionNavigation;
  message?: string;
  errors?: ValidationError[];
  invalidData?: InvalidData;
};

export interface InvalidData {
  submissionId: string;
  sectionId: string;
  multiResponse?: string[];
  response?: string;
}
export interface QuestionPostBody {
  questionId: string;
  submissionId: string;
  response?: string;
  multiResponse?: string[];
  attachment?: File;
}
export interface ApplicationDetailsInterface {
  grantSchemeId: string;
  grantApplicationId: string;
  grantSubmissionId: string;
  submissionStatus: string;
  applicationName: string;
  sections: SectionData[];
}

export interface SectionData {
  sectionId: string;
  sectionTitle: string;
  sectionStatus: string;
  questionIds: string[];
  questions: QuestionType[];
}

export interface QuestionData {
  grantSchemeId: string;
  grantApplicationId: string;
  grantSubmissionId: string;
  sectionId: string;
  sectionTitle: string;
  question: QuestionType;
  nextNavigation: QuestionNavigation;
  previousNavigation: QuestionNavigation;
  error?: ValidationError[];
  temporaryErrorInputValue?: string[];
}

export interface QuestionType {
  questionId: string;
  profileField?: string;
  displayText?: string;
  questionSuffix?: string;
  fieldTitle: string;
  hintText?: string;
  responseType: string;
  validation: QuestionValidation;
  response?: string;
  options?: string[];
  multiResponse?: string[];
  error?: ValidationError[];
  attachmentId?: string;
}

export interface QuestionValidation {
  mandatory: boolean;
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  greaterThanZero?: boolean;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
}

export interface QuestionNavigation {
  sectionId: string;
  questionId: string;
  sectionList?: boolean;
}

export interface FileUploadBody {
  attachment: File;
}

export interface NextNavigation {
  nextNavigation: QuestionNavigation;
}
