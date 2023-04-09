import axios from "axios";

export default async function httpRequest(config) {
  return await axios.request(config);
}