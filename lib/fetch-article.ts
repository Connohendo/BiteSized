import { extract } from "@extractus/article-extractor";

const MAX_ARTICLE_LENGTH = 80_000;

export async function fetchArticleText(url: string): Promise<string> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("URL must be http or https.");
  }

  const article = await extract(url);
  if (!article?.content) {
    throw new Error("Could not extract article content from this URL.");
  }

  const text = article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) {
    throw new Error("Extracted article content was empty.");
  }

  return text.length > MAX_ARTICLE_LENGTH ? text.slice(0, MAX_ARTICLE_LENGTH) : text;
}
