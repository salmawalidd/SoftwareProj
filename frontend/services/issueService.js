import axios from "axios";

const API_URL = "http://192.168.1.25:8000/api/issues";

export const createIssue = async (issueData, token) => {
  const response = await axios.post(API_URL, issueData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};