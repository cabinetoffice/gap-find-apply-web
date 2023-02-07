import moment from 'moment';
import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { isGrantAdvertNotPublished } from './util';

type DateTimeProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function DateTime({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: DateTimeProps) {
  let outputMonth, outputTime, actionText;

  if (
    question.multiResponse !== null &&
    question.multiResponse[0] &&
    question.multiResponse[1] &&
    question.multiResponse[2] &&
    question.multiResponse[3] &&
    question.multiResponse[4]
  ) {
    actionText = 'Change';
    let [day, month, year, hour, minute] = question.multiResponse;
    let date = moment([year, Number.parseInt(month) - 1, day, hour, minute]);
    outputMonth = date.format('D MMMM YYYY');
    outputTime = date.format('HH:mma');
  } else {
    actionText = 'Add';
  }
  return (
    <>
      <div className="govuk-summary-list__row">
        <dt
          className="govuk-summary-list__key"
          data-cy={`cy-summary-${section.title}-${question.title}`}
        >
          {`${question.title} date`}
        </dt>

        <dd
          className="govuk-summary-list__value"
          data-cy={`cy-summary-${section.title}-${question.title}-response`}
        >
          {outputMonth}
        </dd>
        {isGrantAdvertNotPublished(status) && (
          <dd className="govuk-summary-list__actions">
            <CustomLink
              href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
              dataCy={`cy-summary-${section.title}-${question.title}-change`}
              ariaLabel={`${actionText} response for ${question.title} date question`}
            >
              {actionText}
            </CustomLink>
          </dd>
        )}
      </div>

      <div className="govuk-summary-list__row">
        <dt
          className="govuk-summary-list__key"
          data-cy={`cy-summary-${section.title}-${question.title}-time`}
        >
          {`${question.title} time`}
        </dt>

        <dd
          className="govuk-summary-list__value"
          data-cy={`cy-summary-${section.title}-${question.title}-response-time`}
        >
          {outputTime}
        </dd>

        {isGrantAdvertNotPublished(status) && (
          <dd className="govuk-summary-list__actions">
            <CustomLink
              href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
              dataCy={`cy-summary-${section.title}-${question.title}-change-time`}
              ariaLabel={`${actionText} response for ${question.title} time question`}
            >
              {actionText}
            </CustomLink>
          </dd>
        )}
      </div>
    </>
  );
}
