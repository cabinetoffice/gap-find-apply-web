import TurndownService from 'turndown';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

const htmlToRichText = async (html: string) => {
  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(html);
  const richText = await richTextFromMarkdown(markdown);

  return richText;
};

export default htmlToRichText;
