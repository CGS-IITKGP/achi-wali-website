import api from "../axiosApi";
import { IMediaSignedToken } from "../types/domain.types";

export async function uploadToCloudinary(
    file: File
): Promise<{ publicId: string; url: string }> {
    const signResponse = await api("POST", "/media/sign");

    if (signResponse.action === null) {
        throw new Error("Server Error while signing.");
    }
    else if (signResponse.action === false) {
        throw new Error(signResponse.statusCode + ": " + signResponse.message);
    }

    const signedToken = signResponse.data as IMediaSignedToken;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signedToken.apiKey);
    formData.append("folder", signedToken.folder);
    formData.append("public_id", signedToken.publicId);
    formData.append("timestamp", signedToken.timestamp);
    formData.append("signature", signedToken.signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signedToken.cloudName}/image/upload`;

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
    });

    const data = await cloudinaryResponse.json();

    if (data.error) {
        throw new Error(data.error.message || "Cloudinary upload failed.");
    }

    return {
        publicId: data.public_id,
        url: data.secure_url,
    };
}
