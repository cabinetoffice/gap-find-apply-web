import htmlToRichText from './htmlToRichText';

describe('htmlToRichText', () => {
  it('Should convert html to rich text', async () => {
    const html = '<h1>test heading</h1>';

    const richText = await htmlToRichText(html);

    expect(richText).toStrictEqual({
      content: [
        {
          content: [
            { data: {}, marks: [], nodeType: 'text', value: 'test heading' },
          ],
          data: {},
          nodeType: 'heading-1',
        },
      ],
      data: {},
      nodeType: 'document',
    });
  });
});
