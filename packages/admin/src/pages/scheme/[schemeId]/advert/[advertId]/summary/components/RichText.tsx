import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { Block, BLOCKS } from '@contentful/rich-text-types';
import { ReactNode } from 'react';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import { isGrantAdvertNotPublished } from './util';

const rich_text_options = {
  renderNode: {
    [BLOCKS.HEADING_1]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
    [BLOCKS.HEADING_3]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
    [BLOCKS.HEADING_4]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
    [BLOCKS.HEADING_5]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
    [BLOCKS.HEADING_6]: (node: Block, children: ReactNode) => (
      <p className="govuk-!-font-weight-bold">{children}</p>
    ),
  },
};

type RichTextProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function RichText({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: RichTextProps) {
  let response, actionText;
  const doesRichTextHaveContent =
    !!question?.multiResponse?.at(1) &&
    !!JSON.parse(question?.multiResponse![1])?.content.length;

  if (doesRichTextHaveContent) {
    response = documentToReactComponents(
      JSON.parse(question.multiResponse?.at(1) as string),
      rich_text_options as any
    );

    actionText = 'Change';
  } else {
    response = null;
    actionText = 'Add';
  }

  return (
    <div className="govuk-summary-list__row">
      <dt
        className="govuk-summary-list__key"
        data-cy={`cy-summary-${section.title}-${question.title}`}
      >
        <div>{question.title}</div>
      </dt>
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-summary-${section.title}-${question.title}-response`}
      >
        {response}
      </dd>

      {isGrantAdvertNotPublished(status) && (
        <dd className="govuk-summary-list__actions">
          <div>
            <CustomLink
              href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
              dataCy={`cy-summary-${section.title}-${question.title}-change`}
              ariaLabel={`${actionText} response for ${question.title} question`}
            >
              {actionText}
            </CustomLink>
          </div>
        </dd>
      )}
    </div>
  );
}
