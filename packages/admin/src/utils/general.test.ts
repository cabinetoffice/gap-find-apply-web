import { downloadFile } from './general';

describe('downloadFile', () => {
  it('Should download the file', () => {
    const link = {
      download: '',
      href: '',
      click: jest.fn(),
    };

    // To allow us to pass a non-HtmlElement into mockImplementation and confirm that the function works as intended
    // @ts-ignore
    jest.spyOn(document, 'createElement').mockImplementation(() => link);

    downloadFile('fileName', '#');

    expect(link.download).toStrictEqual('#');
    expect(link.href).toStrictEqual('fileName');
    expect(link.click).toHaveBeenCalledTimes(1);
  });
});
