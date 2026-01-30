import { IResponse } from "./types/response.types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
    validateStatus: () => true,
    withCredentials: true,
    timeout: 12500,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axiosInstance<any>({
            method,
            url,
            ...(Object.keys(data.query).length ? { params: data.query } : {}),
            ...(method !== "GET" ? { data: data.body } : {}),
        });

        if (!response.data ||
            typeof response.data !== "object" ||
            !("action" in response.data)
        ) {
            throw Error("Unexpected API response format.");
        }

        if (response.data.action === undefined) {
            if (response.status === 405) {
                return {
                    action: false,
                    message: "Method not Allowed.",
                    statusCode: response.status,
                } as IResponse;
            }

            return {
                action: false,
                message: "Unexpected API response format.",
                statusCode: response.status,
            } as IResponse;
        }

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
