import env from "@/env";
import { Client, Databases, Users, Avatars, Storage } from "node-appwrite";



let client = new Client();

client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId)
    .setKey(env.appwrite.apiKey)
;


const databases = new Databases(client);
const users = new Users(client);
const avatars = new Avatars(client);
const storage = new Storage(client);



export { client, databases, users, avatars, storage };