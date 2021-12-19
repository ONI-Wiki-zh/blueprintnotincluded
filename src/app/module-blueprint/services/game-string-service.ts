import { getLocaleId } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { po } from 'gettext-parser'
import { debug } from 'console';
const BASE_STRING_DIR = "assets/strings"

const gameStrings = {
  'ko': 'strings_preinstalled_ko_klei.po',
  'ru': 'strings_preinstalled_ru_klei.po',
  'zh-Hans': 'strings_preinstalled_zh_klei.po',
}
@Injectable({ providedIn: 'root' })
export class GameCodeService {
  private poFile: string;
  private poData: Promise<Record<string, string>>;

  constructor(@Inject(LOCALE_ID) private locale: string, private http: HttpClient) {
    this.poFile = gameStrings[this.locale] || gameStrings[getLocaleId(this.locale)]
    const ctx2str: Record<string, string> = {}

    this.poData = new Promise(async (res, rej) => {
      this.http.get(BASE_STRING_DIR + '/' + this.poFile, { responseType: 'text' }).subscribe(data => {
        Object.entries(po.parse(data).translations).forEach(([msgctxt, tr]) => {
          let translated = tr?.[Object.keys(tr)?.[0]]?.msgstr?.[0]
          if (translated) {
            translated = translated.replace(/<color=#.+?>(.*?)<\/color>/i, '$1')
            translated = translated.replace(/<size=.+?>(.*?)<\/size>/i, '$1')
            translated = translated.replace(/<style=.+?>(.*?)<\/style>/i, '$1')
            translated = translated.replace(/<smallcaps>(.*?)<\/smallcaps>/i, '$1')
            translated = translated.replace(/<link=".+?">(.*?)<\/link>/i, '$1')
            translated = translated.replace(/<alpha=#.+?>((.|\n)*?)<\/color>/i, '$1')
            translated = translated.replace(/<indent=#.+?>((.|\n)*?)<\/indent>/i, '$1')
          }
          ctx2str[msgctxt] = translated
        })
        res(ctx2str);
      })
    })
  }

  async getStr(msgctxt: string) {
    return (await this.poData)[msgctxt]
  }
}
