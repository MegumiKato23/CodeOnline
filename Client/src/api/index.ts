import axios from 'axios';

interface CodeData {
  html: string;
  css: string;
  js: string;
}

export default {
  saveCode: (data: { userId: string; html: string; css: string; js: string }) =>
    axios.post('http://localhost:3001/api/code/save', data),

  getCode: (userId: string) => axios.get<CodeData>(`http://localhost:3001/api/code/${userId}`),
};
