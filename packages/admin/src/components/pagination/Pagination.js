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
  itemsPerPage = 10,
  totalItems = 0,
  itemType = 'items',
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
      buildPaginationListItems(
        router,
        currentPage,
        itemsPerPage,
        PAGINATION_PREVIOUS_ELEMENT
      )
    );
  }

  //code for adding 1,2,3 and so on page numbers
  for (let i = 0; i < pageIndexArr.length; i++) {
    if (pageIndexArr[i] === PAGINATION_ELLIPSIS_ELEMENT) {
      paginationElements.push(
        buildPaginationListItems(
          router,
          i,
          itemsPerPage,
          PAGINATION_ELLIPSIS_ELEMENT,
          pageIndexArr[i + 1],
          pageIndexArr[i - 1]
        )
      );
    } else {
      if (currentPage === pageIndexArr[i]) {
        paginationElements.push(
          buildPaginationListItems(
            router,
            pageIndexArr[i],
            itemsPerPage,
            PAGINATION_ACTIVE_ELEMENT
          )
        );
      } else {
        paginationElements.push(
          buildPaginationListItems(
            router,
            pageIndexArr[i],
            itemsPerPage,
            PAGINATION_NUMERIC_ELEMENT
          )
        );
      }
    }
  }

  //code for adding next button
  if (totalPage > 1 && currentPage < totalPage) {
    paginationElements.push(
      buildPaginationListItems(
        router,
        currentPage,
        itemsPerPage,
        PAGINATION_NEXT_ELEMENT
      )
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
      <p
        className="moj-pagination__results"
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
