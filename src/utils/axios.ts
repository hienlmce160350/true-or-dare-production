import { HOST_API } from "@/config-global";
import { Room } from "@/types/room/room";
import axios, { AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({ baseURL: HOST_API });

export default axiosInstance;

// For fetching data
export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// For posting data
export const poster = async (
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => {
  try {
    const res = await axiosInstance.post(url, data, { ...config });
    return res;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Forward the error response data
      throw error.response.data;
    }
    throw error; // Re-throw if it's not an Axios error or doesn't have response
  }
};

export const patcher = async (
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => {
  try {
    const res = await axiosInstance.patch(url, data, { ...config });
    return res;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Forward the error response data
      throw error.response.data;
    }
    throw error; // Re-throw if it's not an Axios error or doesn't have response
  }
};

// For deleting data
export const deleter = async (
  args: string | [string, AxiosRequestConfig],
  data?: unknown // Optional data parameter for body
) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const axiosConfig = data
    ? { ...config, data } // If data exists, add it to the config
    : config; // Otherwise, keep the original config

  const res = await axiosInstance.delete(url, axiosConfig);

  return res.data;
};

export const endpoints = {
  question: {
    list: "/api/questions/questions",
  },
  room: {
    list: "/api/rooms/list",
    create: "/api/rooms/create",
    join: (id: Room["roomId"]) => `/api/rooms/${id}/join`,
    leave: (id: Room["roomId"]) => `/api/rooms/${id}/leave-room`,
    detail: (id: Room["roomId"]) => `/api/rooms/${id}`,
    changePlayerName: (id: Room["roomId"]) => `/api/rooms/${id}/change-name`,
    start: (id: Room["roomId"]) => `/api/rooms/${id}/start`,
    reset: (id: Room["roomId"]) => `/api/rooms/${id}/reset-game`,
    getQuestion: (id: Room["roomId"]) => `/api/rooms/${id}/get-question`,
    nextPlayer: (id: Room["roomId"]) => `/api/rooms/${id}/next-player`,
  },
};
