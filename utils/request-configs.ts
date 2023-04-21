import FormData from "form-data";
import { CloudxImage } from '../utils/interfaces';
import fs from 'fs';

let db: CloudxImage

const connectionData = fs.readFileSync('./data/cloudximageData.json', { encoding:"utf-8"});
(db = JSON.parse(connectionData));

export class RequestBuilder {
  private baseURL: string;
  private headers: object;
  private method: string;
  private data: FormData | undefined;
  private url: string;

  constructor() {
    this.baseURL = `http://${db.instance.publicIp}/api`;
    this.url = '';
    this.headers = { 'Content-Type': 'application/json' };
    this.method = 'get' || 'post' || 'delete';
    this.data = undefined;
  }

  setUrl(params: string) {
    this.url = params;
    return this;
  }

  setMethod(method: 'get' | 'post' | 'delete') {
    this.method = method;
    return this;
  }

  setData(data: FormData) {
    this.data = data;
    return this;
  }

  setHeaders(contentType: 'application/json' | 'multipart/form-data') {
    this.headers = { 'Content-Type': contentType };
  }
}