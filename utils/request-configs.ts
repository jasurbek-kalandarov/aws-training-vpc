import FormData from "form-data";
import { readJsonData } from "./readData";
import { CloudxImage } from "./interfaces";

let cloudximage: CloudxImage;

(async () => {
  cloudximage = await readJsonData("cloudximage");
})();

export class RequestBuilder {
  private baseURL: string;
  private headers: object;
  private method: string;
  private data: FormData | undefined;

  constructor() {
    this.baseURL = `${cloudximage.instance.publicIp}/api`;
    this.headers = { 'Content-Type': 'application/json' };
    this.method = 'get' || 'post' || 'delete';
    this.data = undefined;
  }

  setUrl(params: string) {
    this.baseURL += params;
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
}