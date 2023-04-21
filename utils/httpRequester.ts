import axios, { AxiosResponse } from "axios";

export default async function httpRequest<T>(config: object): Promise<AxiosResponse<T>> {
  return await axios.request(config);
}