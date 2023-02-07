import { FC } from 'react';
interface ProcessAddressProps {
  data: string | string[];
  id: string;
  cyTag: string;
}

export const ProcessAddress: FC<ProcessAddressProps> = ({
  data,
  id,
  cyTag,
}) => {
  const addressData = data ? data : [];

  const addressDetails = Array.isArray(addressData)
    ? addressData
    : addressData.split(',');

  const displayAddress = (
    <>
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-organisation-value-${cyTag}`}
      >
        <ul className="govuk-list">
          {addressDetails.map(
            (line: string, index: number, array: string[]) => {
              if (line) {
                return (
                  <li key={index}>
                    {index === array.length - 1 ? line : `${line},`}
                  </li>
                );
              }
            }
          )}
        </ul>
      </dd>
    </>
  );
  return data ? (
    displayAddress
  ) : (
    <dd
      className="govuk-summary-list__value"
      id={id}
      data-cy="cy-organisation-no-address-data"
    >
      -
    </dd>
  );
};
export default ProcessAddress;
