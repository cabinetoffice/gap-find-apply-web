import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { isGrantAdvertNotPublished } from './util';

type ShortTextProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function ShortText({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: ShortTextProps) {
  let response;
  const actionText = question.response ? 'Change' : 'Add';

  //Special handling for one specific field grantWebpageUrl as the error display is completely unique compared to any others.
  if (question.id === 'grantWebpageUrl') {
    if (!question.response) {
      response = (
        <dd className="govuk-summary-list__value">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong
              className="govuk-warning-text__text"
              data-cy={`cy-summary-${section.title}-${question.title}-response`}
            >
              <span className="govuk-warning-text__assistive">Warning</span>
              You have not added a link. You should add a link so applicants
              know where to go after they have read your advert.
            </strong>
          </div>
        </dd>
      );
    } else {
      response = (
        <dd
          className="govuk-summary-list__value"
          data-cy={`cy-summary-${section.title}-${question.title}-response`}
        >
          <a href={question.response}>{question.response}</a>
        </dd>
      );
    }
  } else {
    response = (
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-summary-${section.title}-${question.title}-response`}
      >
        {question.response}
      </dd>
    );
  }

  return (
    <div className="govuk-summary-list__row">
      <dt
        className="govuk-summary-list__key"
        data-cy={`cy-summary-${section.title}-${question.title}`}
      >
        {question.title}
      </dt>

      {response}

      {isGrantAdvertNotPublished(status) && (
        <dd className="govuk-summary-list__actions">
          <CustomLink
            href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
            dataCy={`cy-summary-${section.title}-${question.title}-change`}
            ariaLabel={`${actionText} response for ${question.title} question`}
          >
            {actionText}
          </CustomLink>
        </dd>
      )}
    </div>
  );
}
