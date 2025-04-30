import { Permission } from "node-appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";



export default async function getOrCreateStroage() {
    try {
        await storage.getBucket(questionAttachmentBucket);
        console.log("Bucket connected");
    } catch (error) {
        try {
            await storage.createBucket(
                questionAttachmentBucket, 
                questionAttachmentBucket, 
                [
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.create("users"),
                    Permission.update("users"),
                    Permission.delete("users"),
                ],
                false,
                false,
                undefined,
                ["jpg", "png", "gif", "jpeg", "webp", "heic"]
            );

            console.log("Storage bucket created");
            console.log("Storage bucket connected");
            
            
        } catch (error) {
            console.error("Error creating bucket: ", error);
        }
    }
}