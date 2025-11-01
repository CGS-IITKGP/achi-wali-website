import { IResponse } from "./types/response.types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
    validateStatus: () => true,
    withCredentials: true,
    timeout: 10000,
    baseURL: API_BASE_URL,
});

const api = async (
    method: "GET" | "POST" | "PATCH" | "DELETE",
    url: string,
    data: {
        body?: object;
        query?: object;
    } = {
            body: {},
            query: {},
        }
): Promise<IResponse> => {
    data.body = data.body ?? {};
    data.query = data.query ?? {};

    try {
        const response = await axiosInstance({
            method,
            url,
            ...(Object.keys(data.query).length ? { params: data.query } : {}),
            ...(method !== "GET" ? { data: data.body } : {}),
        });

        return {
            ...response.data,
            statusCode: response.status,
        } as unknown as IResponse;
    } catch (_error) {
        return {
            action: null,
            statusCode: 500,
        };
    }
};

export default api;
