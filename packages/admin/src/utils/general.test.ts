import { downloadFile } from './general';

describe('downloadFile', () => {
  it('Should download the file', () => {
    const link = {
      download: '',
      href: '',
      click: jest.fn(),
    };

    jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => link as unknown as HTMLElement);

    downloadFile('fileName', '#');

    expect(link.download).toStrictEqual('#');
    expect(link.href).toStrictEqual('fileName');
    expect(link.click).toHaveBeenCalledTimes(1);
  });
});
