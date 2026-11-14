import { v2 as cloudinary } from "cloudinary";
import getEnvVariable from "./envVariable";

let configured = false;

const getCloudinary = () => {
    if (!configured) {
        cloudinary.config({
            cloud_name: getEnvVariable("CLOUDINARY_CLOUD_NAME", false),
            api_key: getEnvVariable("CLOUDINARY_API_KEY", false),
            api_secret: getEnvVariable("CLOUDINARY_API_SECRET", false),
        });
        configured = true;
    }
    return cloudinary;
};

// Initial safe attempt if envs exist
if (process.env.BACKEND_CLOUDINARY_CLOUD_NAME) {
    getCloudinary();
}

export default cloudinary;
export { getCloudinary };
