import axios from "axios"; 
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
    baseURL : BASE_URL,
    timeout : 8000 , 
    headers : {
        "Content-Type" : "application/json", 
        Accept : "application/json"
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.message){
            if(error.message.status === 500){
                console.error("Server error . Please try again later.");
            }
            else if(error.code === "ECONNABORTED"){
                console.error("Request timed out . Please try again later.");
            }
            return Promise.reject(error); 
        }
    }
);

export default axiosInstance; 