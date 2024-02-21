import { useRouter } from 'next/router';
import {
  buildPaginationArr,
  buildPaginationListItems,
  PAGINATION_ACTIVE_ELEMENT,
  PAGINATION_ELLIPSIS_ELEMENT,
  PAGINATION_NEXT_ELEMENT,
  PAGINATION_NUMERIC_ELEMENT,
  PAGINATION_PREVIOUS_ELEMENT,
  showingItemsFromCount,
} from './helper';

const Pagination = ({
  additionalQueryData,
  itemsPerPage = 10,
  totalItems = 0,
  itemType = 'items',
  itemCountMargin = false,
}) => {
  const router = useRouter();

  const { query = {} } = router;

  const { page } = query;

  const currentPage = page ? parseInt(page) : 1;

  const totalPage = Math.ceil(totalItems / itemsPerPage);

  const isMultiplePages = totalItems > itemsPerPage;

  const pageIndexArr = buildPaginationArr(currentPage, totalPage);

  const paginationElements = [];

  // code for adding previous button
  if (totalPage > 1 && currentPage > 1) {
    paginationElements.push(
      buildPaginationListItems({
        router,
        currentPage,
        itemsPerPage,
        paginationElementType: PAGINATION_PREVIOUS_ELEMENT,
        additionalQueryData,
      })
    );
  }

  //code for adding 1,2,3 and so on page numbers
  for (let i = 0; i < pageIndexArr.length; i++) {
    if (pageIndexArr[i] === PAGINATION_ELLIPSIS_ELEMENT) {
      paginationElements.push(
        buildPaginationListItems({
          router,
          currentPage: i,
          itemsPerPage,
          paginationElementType: PAGINATION_ELLIPSIS_ELEMENT,
          ellipsisEndAt: pageIndexArr[i + 1],
          ellipsisStartAt: pageIndexArr[i - 1],
          additionalQueryData,
        })
      );
    } else {
      if (currentPage === pageIndexArr[i]) {
        paginationElements.push(
          buildPaginationListItems({
            router,
            currentPage: pageIndexArr[i],
            itemsPerPage,
            paginationElementType: PAGINATION_ACTIVE_ELEMENT,
            additionalQueryData,
          })
        );
      } else {
        paginationElements.push(
          buildPaginationListItems({
            router,
            currentPage: pageIndexArr[i],
            itemsPerPage,
            paginationElementType: PAGINATION_NUMERIC_ELEMENT,
            additionalQueryData,
          })
        );
      }
    }
  }

  //code for adding next button
  if (totalPage > 1 && currentPage < totalPage) {
    paginationElements.push(
      buildPaginationListItems({
        router,
        currentPage,
        itemsPerPage,
        paginationElementType: PAGINATION_NEXT_ELEMENT,
        additionalQueryData,
      })
    );
  }
  return (
    <nav
      className="moj-pagination"
      role="navigation"
      aria-label="results"
      data-cy="cyPaginationComponent"
    >
      {isMultiplePages && (
        <>
          <p className="govuk-visually-hidden">Pagination navigation</p>
          <ul className="govuk-pagination__list">{paginationElements}</ul>
        </>
      )}
      {/* TODO: Is this margin what we want? */}
      <p
        className={`moj-pagination__results ${
          itemCountMargin ? 'govuk-!-margin-top-9' : ''
        }`}
        data-cy="cyPaginationShowingGrants"
        style={{
          paddingTop: '0.6rem',
        }}
      >
        Showing <b>{showingItemsFromCount(currentPage, itemsPerPage)}</b> to{' '}
        <b>
          {currentPage === totalPage ? totalItems : currentPage * itemsPerPage}
        </b>{' '}
        of <b>{totalItems}</b> {itemType}
      </p>
    </nav>
  );
};

export { Pagination };
