import { AxiosError } from 'axios';
import fs from 'fs/promises';
import { getUrls } from './util';

const url = 'https://google.com/';

const main = async (startUrl: string) => {
  const file = await fs.open('./urls.txt', 'w');
  if (!file) throw new Error("Can't open file for writting");

  await getUrls(startUrl, file);
  await file.close();
};

main(url).catch((err: AxiosError) => console.log(err.message));
