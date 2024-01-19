import moment from 'moment';
import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { isGrantAdvertNotPublished } from './util';

type DateProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function Date({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: DateProps) {
  let formattedDateTime, actionText;

  if (
    question.multiResponse !== null &&
    question.multiResponse[0] &&
    question.multiResponse[1] &&
    question.multiResponse[2] &&
    question.multiResponse[3] &&
    question.multiResponse[4]
  ) {
    actionText = 'Change';
    const [day, month, year, hour, minute] = question.multiResponse;
    const date = moment([year, Number.parseInt(month) - 1, day, hour, minute]);

    // Specific handling for the grant
    if (
      question.id === 'grantApplicationOpenDate' ||
      question.id === 'grantApplicationCloseDate'
    ) {
      if (date.hours() === 0 && date.minutes() === 0) {
        const midnightString = '(\\M\\i\\d\\n\\i\\g\\h\\t)';
        if (question.id === 'grantApplicationCloseDate') {
          date.subtract(1, 'minute');
          formattedDateTime = date.format(
            `D MMMM YYYY, ${midnightString} hh:mm A`
          );
        } else {
          date.add(1, 'minute');
          formattedDateTime = date.format(
            `D MMMM YYYY, ${midnightString} \\0:mm A`
          );
        }
      } else {
        formattedDateTime = date.format('D MMMM YYYY, hh:mm A');
      }
    } else {
      formattedDateTime = date.format('D MMMM YYYY, HH:mma');
    }
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
          <span data-cy={`cy-summary-${section.title}-${question.title}-main`}>
            {`${question.title} date`}
          </span>

          {question.summarySuffixText && (
            <>
              <br></br>
              <span
                data-cy={`cy-summary-${section.title}-${question.title}-suffix`}
                className="govuk-body"
              >
                {question.summarySuffixText}
              </span>
            </>
          )}
        </dt>

        <dd
          className="govuk-summary-list__value"
          data-cy={`cy-summary-${section.title}-${question.title}-response`}
        >
          {formattedDateTime}
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
    </>
  );
}
