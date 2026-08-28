import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import db from "../model/db.js";
import { uploadProfilePhoto } from "../services/s3Service.js";

dotenv.config();

const profilesDir = path.resolve(process.env.UPLOAD_DIR || "public/img/profiles");

const migrateTable = async (table, idColumn, userType) => {
    const result = await db.query(
        `SELECT ${idColumn}, profile_photo
           FROM ${table}
          WHERE profile_photo IS NOT NULL
            AND profile_photo <> 'default.svg'
            AND profile_photo NOT LIKE 'profiles/%'`
    );

    for (const user of result.rows) {
        const fileName = path.basename(user.profile_photo);
        const filePath = path.join(profilesDir, fileName);

        try {
            const buffer = await fs.readFile(filePath);
            const extension = path.extname(fileName).toLowerCase();
            const photoKey = await uploadProfilePhoto(
                {
                    buffer,
                    originalname: fileName,
                    mimetype: extension === ".png" ? "image/png" : "image/jpeg"
                },
                userType,
                user[idColumn]
            );

            await db.query(
                `UPDATE ${table} SET profile_photo = $1 WHERE ${idColumn} = $2`,
                [photoKey, user[idColumn]]
            );
            console.log(`Migrated ${table}/${user[idColumn]} -> ${photoKey}`);
        } catch (error) {
            console.error(`Could not migrate ${table}/${user[idColumn]} (${filePath}):`, error.message);
        }
    }
};

try {
    await migrateTable("students", "id_student", "student");
    await migrateTable("teachers", "id_teacher", "teacher");
} finally {
    await db.end();
}
