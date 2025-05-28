import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";


export async function POST (request: NextRequest) {
    try {

        const { questionId, answer, authorId } = await request.json();

        if (!answer || !questionId || !authorId) {
            return NextResponse.json(
                {
                    error: "Please fill out all fields.",
                },
                {
                    status: 400
                }
            )
        }


        const response = await databases.createDocument(db, answerCollection, ID.unique(), {
            content: answer,
            questionId,
            authorId
        })


        const prefs = await users.getPrefs<UserPrefs>(authorId)

        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1
        })



        return NextResponse.json(
            {
                success: true,
                data: response
            },
            {
                status: 200
            }
        )

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


export async function DELETE (request: NextRequest) {
    try {

        const { answerId } = await request.json();

        if (!answerId) {
            return NextResponse.json(
                {
                    error: "Answer id is required.",
                },
                {
                    status: 400
                }
            )
        }


        const answer = await databases.getDocument(db, answerCollection, answerId);

        const deleteResponse = await databases.deleteDocument(db, answerCollection, answerId);


        const prefs = await users.getPrefs<UserPrefs>(answer.authorId)

        await users.updatePrefs(answer.authorId, {
            reputation: Number(prefs.reputation) - 1
        })



        return NextResponse.json(
            {
                success: true,
                message: "Answer deleted successfully."
            },
            {
                status: 200
            }
        )

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error?.message || "An error occurred while deleting the answer.",
            },
            {
                status: error?.status || error?.code || 500
            }
        )
    }
}