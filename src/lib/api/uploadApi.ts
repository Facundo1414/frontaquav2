import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

export const uploadExcelFile = async (formData: FormData) => {
  const token = getAccessToken();
  const { data } = await api.post("/api/upload/excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getFileByName = async (fileName: string): Promise<Blob> => {
  const token = getAccessToken();
  const { data } = await api.get(`/api/upload/getFileByName/${fileName}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return data;
};

export const checkFileStatus = async (fileName: string) => {
  const token = getAccessToken();
  const { data } = await api.get("/api/upload/file-status", {
    headers: { Authorization: `Bearer ${token}` },
    params: { filename: fileName },
  });
  return data;
};
