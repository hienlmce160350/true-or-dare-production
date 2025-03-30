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
  const res = await axiosInstance.post(url, data, { ...config });

  return res;
};

// For patching data
export const patcher = async (
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => {
  const res = await axiosInstance.patch(url, data, { ...config });

  return res;
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
    join: (id: Room['roomId']) => `/api/rooms/${id}/join`,
    leave: (id: Room['roomId']) => `/api/rooms/${id}/leave-room`,
    detail: (id: Room['roomId']) => `/api/rooms/${id}`,
    changePlayerName: (id: Room['roomId']) => `/api/rooms/${id}/change-name`,
  },
};
