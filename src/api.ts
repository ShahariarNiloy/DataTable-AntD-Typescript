import axios from "axios";
import { useQuery } from "react-query";

//!FROM local storage
const token = localStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`,
};
export const AxiosAuthInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  timeout: 1800000,
  headers,
});

AxiosAuthInstance.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const FetchData = ({
  url,
  searchQuery,
  key,
  optionalKey,
  auth,
  dependency,
  dependencyValue,
  addMoreSearchQuery,
}: any) => {
  auth = auth !== false;
  return useQuery(
    [key, optionalKey || ""],
    async () => {
      const { data } = await AxiosAuthInstance.get(
        `${url}${
          searchQuery
            ? `?page=${searchQuery?.page || ""}&search_term=${
                searchQuery?.searchTerm || ""
              }&take=${searchQuery?.take || ""}${addMoreSearchQuery || ""}`
            : ""
        }`
      );

      return data;
    },

    {
      enabled: dependency ? !!dependencyValue : true,
    }
  );
};
