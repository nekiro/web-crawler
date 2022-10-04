import axios from 'axios';
import { FileHandle } from 'fs/promises';

export const outputUrl = async (file: FileHandle, url: string) => {
  process.stdout.write(url);
  await file.appendFile(url);
};

export const getUrls = async (
  baseUrl: string,
  file: FileHandle,
  urls: string[] = []
) => {
  if (urls.includes(baseUrl)) return; // don't crawl the same url twice
  urls.push(baseUrl);

  await outputUrl(file, baseUrl + '\n');

  const response = await axios.get<string>(baseUrl);
  if (typeof response.data !== 'string') {
    return false;
  }

  const matches = response.data.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi
  );
  if (!matches) return false;

  const toCrawlUrls: string[] = [];
  const baseUrlObj = new URL(baseUrl);

  for (const url of matches) {
    const urlObj = new URL(url);
    if (urlObj.origin === baseUrlObj.origin && urlObj.pathname !== '/') {
      await outputUrl(file, `\t${url}\n`);

      // links that got routes
      if (!urlObj.pathname.match(/(\..+)$/)) {
        toCrawlUrls.push(url);
      }
    }
  }

  for (const url of toCrawlUrls) {
    await getUrls(url, file, urls);
  }
  return true;
};
