import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { NextRequest, NextResponse } from "next/server";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query, ID } from "node-appwrite";



export async function POST (request: NextRequest) {
    try {

        const { votedById, voteStatus, typeId, type } = await request.json();

        const searchResponse = await databases.listDocuments(db, voteCollection, [
            Query.equal("votedById", votedById),
            Query.equal("typeId", typeId),
            Query.equal("type", type),
        ]);


        const questionOrAnswer = await databases.getDocument(
            db,
            type === "question" ? questionCollection : answerCollection,
            typeId
        )


        if (searchResponse.documents.length > 0) {

            await databases.deleteDocument(db, voteCollection, searchResponse.documents[0].$id);


            const userPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId)


            await users.updatePrefs(questionOrAnswer.authorId, {
                reputation: searchResponse.documents[0].voteStatus === "upvoted" 
                ? Number(userPrefs.reputation) - 1
                : Number(userPrefs.reputation) + 1
            })
        }


        if (searchResponse.documents.length === 0 || searchResponse.documents[0].voteStatus !== voteStatus) {

            const newVote = await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            })


            const userPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId)


            if (searchResponse.documents[0]) {
                await users.updatePrefs(questionOrAnswer.authorId, {
                    reputation: searchResponse.documents[0].voteStatus === "upvoted" 
                    ? Number(userPrefs.reputation) - 1
                    : Number(userPrefs.reputation) + 1
                })
            }else {
                await users.updatePrefs(questionOrAnswer.authorId, {
                    reputation: voteStatus === "upvoted" 
                    ? Number(userPrefs.reputation) + 1
                    : Number(userPrefs.reputation) - 1
                })
            }


            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.equal("votedById", votedById),
                    Query.limit(1), // for optimization as we only need total
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.equal("votedById", votedById),
                    Query.limit(1), // for optimization as we only need total
                ]),
            ]);



            return NextResponse.json(
                {
                    data: {
                        document: newVote, 
                        voteResult: upvotes.total - downvotes.total 
                    },
                    message: searchResponse.documents[0] ? "Vote Status Updated" : "Voted",
                },
                {
                    status: 201,
                }
            );
            
        }
        

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.equal("votedById", votedById),
                Query.limit(1), // for optimization as we only need total
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.equal("votedById", votedById),
                Query.limit(1), // for optimization as we only need total
            ]),
        ]);



        return NextResponse.json(
            {
                data: {
                    document: null, 
                    voteResult: upvotes.total - downvotes.total 
                },
                message: "Vote Withdrawn",
            },
            {
                status: 201,
            }
        );

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error?.message || "An error occurred while creating the answer.",
            },
            {
                status: error?.status || error?.code || 500
            }
        )
    }
}