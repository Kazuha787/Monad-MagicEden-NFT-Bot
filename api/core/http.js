import axios from "axios";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Content-Type": "application/json",
};

export const get = async (url, options = {}) => {
  try {
    const { headers = {}, ...restOptions } = options;
    const response = await axios.get(url, {
      headers: { ...DEFAULT_HEADERS, ...headers },
      ...restOptions,
    });
    return response.data;
  } catch (error) {
    console.error("[-] Error in GET request:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
};

export const post = async (url, data, options = {}) => {
  try {
    const { headers = {}, ...restOptions } = options;
    const response = await axios.post(url, data, {
      headers: { ...DEFAULT_HEADERS, ...headers },
      ...restOptions,
    });
    return response.data;
  } catch (error) {
    console.error("[-] Error in POST request:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
};

export default {
  get,
  post,
};
