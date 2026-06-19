import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';

export class GrantMandatoryQuestionService {
  private static instance: GrantMandatoryQuestionService;

  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantMandatoryQuestionService {
    if (!GrantMandatoryQuestionService.instance) {
      GrantMandatoryQuestionService.instance =
        new GrantMandatoryQuestionService();
    }
    return GrantMandatoryQuestionService.instance;
  }

  private validateSubmissionId(submissionId: string): string {
    const trimmedSubmissionId = submissionId?.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!trimmedSubmissionId || !uuidRegex.test(trimmedSubmissionId)) {
      throw new Error('Invalid submissionId format');
    }
    return trimmedSubmissionId;
  }

  public async getMandatoryQuestionById(
    mandatoryQuestionId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async getMandatoryQuestionBySubmissionId(
    submissionId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const safeSubmissionId = encodeURIComponent(
      this.validateSubmissionId(submissionId)
    );
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/get-by-submission/${safeSubmissionId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async getMandatoryQuestionBySchemeId(
    jwt: string,
    schemeId: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/scheme/${schemeId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async updateMandatoryQuestion(
    jwt: string,
    mandatoryQuestionId: string,
    url: string,
    body: GrantMandatoryQuestionDto
  ): Promise<string> {
    const { data } = await axios.patch<string>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}?url=${url}`,
      body,
      axiosConfig(jwt)
    );

    return data;
  }

  public async createMandatoryQuestion(
    schemeId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.post<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions?schemeId=${parseInt(
        schemeId
      )}`,
      {},
      axiosConfig(jwt)
    );

    return data;
  }

  public async ensureMandatoryQuestionForSubmission(
    jwt: string,
    submissionId: string
  ): Promise<GrantMandatoryQuestionDto> {
    const safeSubmissionId = encodeURIComponent(
      this.validateSubmissionId(submissionId)
    );
    const { data } = await axios.post<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/ensure-mandatory-question/${safeSubmissionId}`,
      {},
      axiosConfig(jwt)
    );

    return data;
  }

  /**
   * Single entry point a page uses to obtain the mandatory question a submission should edit/display.
   * The caller passes only its raw context; this method owns the whole policy:
   *  - non mandatory-question section (e.g. eligibility/custom): nothing to do, returns null;
   *  - editable submission: heals (ensures the submission owns its own mandatory question, blanking
   *    funding for a borrowed record) and returns it;
   *  - non-editable submission (submitted/removed): a plain read.
   * Any backend error resolves to null so a page render is never broken by this.
   */
  public async resolveMandatoryQuestionForSubmission(
    jwt: string,
    submissionId: string,
    context: MandatoryQuestionContext = {}
  ): Promise<GrantMandatoryQuestionDto | null> {
    const isEditable =
      !context.hasBeenSubmitted && context.grantApplicationStatus !== 'REMOVED';
    const isMandatoryQuestionContext =
      !context.sectionId ||
      context.sectionId === 'ORGANISATION_DETAILS' ||
      context.sectionId === 'FUNDING_DETAILS';

    if (!isMandatoryQuestionContext) {
      return null;
    }

    try {
      return isEditable
        ? await this.ensureMandatoryQuestionForSubmission(jwt, submissionId)
        : await this.getMandatoryQuestionBySubmissionId(submissionId, jwt);
    } catch (e) {
      return null;
    }
  }

  public async existBySchemeIdAndApplicantId(schemeId: string, jwt: string) {
    const { data } = await axios.get<boolean>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/scheme/${schemeId}/exists`,
      axiosConfig(jwt)
    );
    return data;
  }
}
export interface MandatoryQuestionContext {
  hasBeenSubmitted?: boolean;
  grantApplicationStatus?: string;
  sectionId?: string;
}

export interface GrantMandatoryQuestionDto {
  id?: string;
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  charityCommissionNumber?: string;
  companiesHouseNumber?: string;
  orgType?: string;
  fundingAmount?: string;
  fundingLocation?: string[];
  schemeId?: number;
  submissionId?: string;
  mandatoryQuestionsComplete?: boolean;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
