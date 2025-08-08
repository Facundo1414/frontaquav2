import api from './axiosInstance';

export const getUserById = async (id: number) => {
  const { data } = await api.get(`/user/${id}`);
  return data;
};