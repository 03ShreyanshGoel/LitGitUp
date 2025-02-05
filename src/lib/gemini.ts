const { GoogleGenerativeAI } = require("@google/generative-ai");
import { Document } from "@langchain/core/documents"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummariseCommit = async (diff: string) => {
    console.log("Starting AI summarization for git diff...");
    try {
        const response = await model.generateContent([
            `You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index aadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified:
        - A line starting with \`+\` means it was added.
        - A line starting with \`-\` means that line was deleted.
        - A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding. It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \'\'\'
        * Raised the amount of returned recordings from \'10\' to \'100\' [packages/server/recordings_api.ts], [packages/server/constants.ts]
        * Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
        * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
        * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        * Lowered numeric tolerance for test files
        \'\'\'
        Most commits will have fewer comments than this example list. The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit. Do not include parts of the example in your summary. It is given only as an example of appropriate comments.`, `Please summarise the following diff file:\n\n ${diff}`,]);
        return response.response.text();
    }
    catch (error) {
        console.error("Error during AI summarization:", error);
        throw new Error("Failed to summarize the commit.");
    }
};

export async function summariseCode(doc: Document) {
    console.log("Starting code summary for:", doc.metadata.source);
    try {
        const code = doc.pageContent.slice(0, 10000);// limit to 10,000 characters
        const response = await model.generateContent([
            `
            You are an intelligent senior software engineer specializing in onboarding junior engineers onto projects.`,
            `You are onboarding a junior engineer and explaining the purpose of the ${doc.metadata.source} file.
    
            Here is the code:
            ---
            ${code}
            ---
    
            Provide a clear, concise, and professional summary (max 100 words) of the code above.
        `]);
        console.log("Generated prompt for code summary."); // Log prompt creation

        console.log("Received response from AI for code summary:", response); // Log AI response
        return response.response.text();
    } catch (error) {
        console.error("Error during code summarization:", error);
        return "";
    }

}


export async function generateEmbedding(summary: string) {
    console.log("Starting embedding generation for summary."); // Debug log
    try {
        const model = genAI.getGenerativeModel({
            model: "text-embedding-004",
        });
        console.log("Embedding model initialized."); // Log model initialization

        const result = await model.embedContent(summary); // Generate embeddings
        console.log("Received embedding result:", result); // Log result from embedding generation

        const embedding = result.embedding;
        console.log("Extracted embedding values."); // Log embedding extraction
        return embedding.values;
    } catch (error) {
        console.error("Error during embedding generation:", error); // Log error details
        throw new Error("Failed to generate embeddings.");
    }
}

// Test example
(async () => {
    console.log("Testing embedding generation..."); // Log test initialization
    try {
        const embedding = await generateEmbedding("hello world");
        console.log("Generated embedding:", embedding); // Log generated embedding
    } catch (error) {
        console.error("Error during test embedding generation:", error); // Log test error
    }
})();
