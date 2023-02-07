import { render, screen } from '@testing-library/react';
import {
  organisationAddressDetailsArray,
  organisationAddressDetailsArrayWithEmpty,
} from './processAddress.data';
import ProcessAddress from './processAddress';

const componentWithAddress = (
  <ProcessAddress data={organisationAddressDetailsArray} id={''} cyTag={''} />
);
const componentWithAddressWithEmptyLine = (
  <ProcessAddress
    data={organisationAddressDetailsArrayWithEmpty}
    id={''}
    cyTag={''}
  />
);
const componentWithoutAddress = <ProcessAddress data={''} id={''} cyTag={''} />;
const componentWithStringAddress = (
  <ProcessAddress data={'comma,separated'} id={''} cyTag={''} />
);
describe('should return the correct data for the address', () => {
  it('should return a hyphen if there is no address', () => {
    render(componentWithoutAddress);
    const address = screen.getByText('-');
    expect(address).toBeDefined();
    expect(screen.getAllByText('-')).toHaveLength(1);
  });
  it('should return a comma separated list', () => {
    render(componentWithStringAddress);
    expect(screen.getByText('comma,')).toBeDefined();
    expect(screen.getByText('separated')).toBeDefined();
  });

  it('should return list if there is an address', () => {
    render(componentWithAddress);
    expect(screen.getByText('First Line,')).toBeDefined();
    expect(screen.getByText('Second Line,')).toBeDefined();
    expect(screen.getByText('Edinburgh,')).toBeDefined();
    expect(screen.getByText('Lothian,')).toBeDefined();
    expect(screen.getByText('EH22 2TH')).toBeDefined();
  });

  it('should return only the non empty field of an address', () => {
    render(componentWithAddressWithEmptyLine);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('First Line,')).toBeDefined();
    expect(screen.getByText('Second Line,')).toBeDefined();
    expect(screen.getByText('Edinburgh,')).toBeDefined();
    expect(screen.getByText('EH22 2TH')).toBeDefined();
  });
});
