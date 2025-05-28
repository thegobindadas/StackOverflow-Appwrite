import { db } from "../name";
import { databases } from "./config";
import createQuestionCollection from "./question.collection";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createVoteCollection from "./vote.collection";



export default async function getOrCreateDB() {
    try {
        await databases.get(db);
        console.log("Database connected");
    } catch (error) {
        try {
            await databases.create(db, db);

            console.log("Database created");
            

            // Create collections
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ]);
            
            console.log("Collections created");
            console.log("Database connected");
            
        } catch (error) {
            console.log("Error while creating database or collections: ", error);
        }
    }


    return databases;
}