import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || "us-east-1";

const s3 = new S3Client({ region });

export const uploadProfilePhoto = async (file, userType, userId) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileId = crypto.randomUUID();
    const key = `profiles/${userType}/${userId}/${fileId}${extension}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: "AES256"
    }));

    return key;
};

export const getProfilePhotoUrl = async (key) => {
    if (!key || key === "default.svg") {
        return null;
    }

    return getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucket,
            Key: key
        }),
        {
            expiresIn: Number(process.env.PROFILE_URL_EXPIRES_IN || 900)
        }
    );
};

export const deleteProfilePhoto = async (key) => {
    if (!key || key === "default.svg") {
        return;
    }

    await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
    }));
};