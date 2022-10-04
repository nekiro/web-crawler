import * as util from '../util';
import axios from 'axios';

describe('util', () => {
  describe('outputUrl', () => {
    test('should call stdout write (console.log)', () => {
      const url = 'foo';
      const stdoutSpy = jest.spyOn(process.stdout, 'write');
      util.outputUrl({ appendFile: jest.fn() } as any, url);
      expect(stdoutSpy).toBeCalledWith(url);
    });
    test('should call appendFile', () => {
      const url = 'foo';
      const appendFile = jest.fn().mockResolvedValue(true);
      util.outputUrl({ appendFile } as any, url);
      expect(appendFile).toBeCalledWith(url);
    });
  });

  describe('getUrls', () => {
    test('should output expected data to file', async () => {
      const url = 'https://foo.com/';

      const correctOutput = `https://foo.com/\n\thttps://foo.com/contact\n\thttps://foo.com/about\n\thttps://foo.com/foo\n\thttps://foo.com/about/bar.jpg\nhttps://foo.com/contact\n\thttps://foo.com/about\nhttps://foo.com/about\nhttps://foo.com/foo\n`;
      let generatedOutput = '';

      const mockFile: any = {
        appendFile: jest.fn((value: string) => (generatedOutput += value)),
      };

      // mock real scenario when parsing urls
      const mockedMatchedUrls: any = {
        'https://foo.com/': [
          'https://foo.com/contact',
          'https://foo.com/about',
          'https://foo.com/foo',
          'https://foo.com/about/bar.jpg',
        ],
        'https://foo.com/contact': ['https://foo.com/about'],
        'https://foo.com/about': null, // axios data is not a string scenario
        'https://foo.com/foo': [''], // no matches scenario
      };

      jest.spyOn(axios, 'get').mockImplementation(((url: string) => {
        return { data: (mockedMatchedUrls[url] as string[])?.join('\n') };
      }) as any);

      const result = await util.getUrls(url, mockFile);

      expect(generatedOutput).toEqual(correctOutput);
      expect(result).toBeTruthy();
    });
  });
});
