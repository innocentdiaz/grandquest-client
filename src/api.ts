import { create } from 'apisauce';

const api = create({
  baseURL: process.env.VUE_APP_API_ROOT,
});

api.addResponseTransform((res) => {
  res.data = res.data || {};
});

export default api;
