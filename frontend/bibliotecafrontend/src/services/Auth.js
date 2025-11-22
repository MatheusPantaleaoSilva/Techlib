import api from "./services/Api";

export const loginUser = async ({ username, senha }) => {
  const response = await api.post("/login", { username, senha });
  return response.data;
};
