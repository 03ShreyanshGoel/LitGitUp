'use server'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()
    const queryVector = await generateEmbedding(question)
    const result = await db.$queryRaw`SELECT 
            "fileName", 
            "sourceCode", 
            "summary", 
            1 - ("summaryEmbedding" <=> ${queryVector}::vector) AS similarity 
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${queryVector}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY similarity desc
        LIMIT 10
        `as {
        fileName: string;
        sourceCode: string;
        summary: string
    }[]

    let context = ''
    for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    }

    (async () => {
        const { textStream } = await streamText({
            model: google('gemini-1.5-flash'),
            prompt: `You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern.
The AI assistant is a brand-new, powerful, human-like artificial intelligence.

The traits of the AI include expert knowledge, helpfulness, cleverness, and articulateness.
The AI is a well-behaved and well-mannered individual.
The AI is always friendly, kind, and inspiring and is eager to provide vivid and thoughtful responses to the user.
The AI possesses the sum of all knowledge in its brain and can accurately answer nearly any question about any topic in .
If the question pertains to code or a specific file, the AI will provide a detailed answer, giving step-by-step instructions.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

The AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.

If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer."
The AI assistant will not apologize for previous responses but will instead indicated when new information has been gained.

The AI assistant will not invent anything that is not drawn directly from the context.

Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, and ensure there is no ambiguity.`,
        })
        for await (const delta of textStream) {
            stream.update(delta)
        }
        stream.done()
    })()
    return {
        output: stream.value,
        filesReferences: result
    }
}