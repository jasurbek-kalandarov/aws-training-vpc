import axios from "axios";

export default async function httpRequest(config: object) {
  return await axios.request(config);
}