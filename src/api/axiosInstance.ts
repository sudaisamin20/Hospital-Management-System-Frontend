import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `http://localhost:5000/api`,
});
// let isRefreshing = false;

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers["auth-token"] = token;
  }

  return config;
});

// axiosInstance.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;

//         try {
//           const res = await axios.post(
//             "http://localhost:5000/api/auth/refresh-token",
//             {
//               refreshToken: localStorage.getItem("refresh-token"),
//             },
//           );

//           const newToken = res.data.accessToken;

//           localStorage.setItem("auth-token", newToken);

//           isRefreshing = false;

//           originalRequest.headers["auth-token"] = newToken;

//           return axiosInstance(originalRequest);
//         } catch (err) {
//           localStorage.clear();
//           window.location.href = "/login";
//           console.log(err);
//         }
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default axiosInstance;
