import axios from "axios"
const { GithubRepoLoader } = require("@langchain/community/document_loaders/web/github");

import { db } from "@/server/db";
import { generateEmbedding, summariseCode } from "./gemini";
import { Document } from "@langchain/core/documents";
import { Octokit } from "octokit";

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
    const { data } = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path,
    });
    if (!Array.isArray(data) && data.type === 'file') {
        return acc + 1;
    }

    if (Array.isArray(data)) {
        let fileCount = 0
        const directories: string[] = []
        for (const item of data) {
            if (item.type === 'dir') {
                directories.push(item.path)
            } else {
                fileCount++
            }
        }
        if (directories.length > 0) {
            const directoryCounts = await Promise.all(directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0)))
            fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
        }
        return acc + fileCount
    }
    return acc
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    const octokit = new Octokit({ auth: githubToken });
    const githubOwner = githubUrl.split('/')[3];
    const githubRepo = githubUrl.split('/')[4];
    if (!githubOwner || !githubRepo) {
        return 0;
    }
    const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0);
    return fileCount;
};

// Function to get the default branch of the repository
const getDefaultBranch = async (githubUrl: string, githubToken?: string): Promise<string> => {
    const repoPath = githubUrl.replace("https://github.com/", ""); // Extract 'owner/repo'
    const apiUrl = `https://api.github.com/repos/${repoPath}`;
    const token = githubToken || process.env.GITHUB_TOKEN;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}`,
            },
        });
        return response.data.default_branch; // Return the default branch (e.g., "main" or "master")
    } catch (error) {
        console.error("Error fetching default branch:", error);
        throw new Error("Failed to fetch the default branch of the repository.");
    }
};

// Load the GitHub repository with the dynamically fetched default branch
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    console.log(`Starting to load GitHub repository: ${githubUrl}`);
    const token = githubToken || process.env.GITHUB_TOKEN;

    try {
        const defaultBranch = await getDefaultBranch(githubUrl, token);
        console.log(`Default branch identified: ${defaultBranch}`);

        const loader = new GithubRepoLoader(githubUrl, {
            accessToken: token,
            branch: defaultBranch, // Use the dynamically fetched default branch
            ignoreFiles: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"],
            recursive: true,
            unknown: "warn",
            maxConcurrency: 5,
        });

        console.log("Loading documents from GitHub repository...");
        const docs = await loader.load();
        console.log(`Successfully loaded ${docs.length} documents.`);
        return docs;

    } catch (error) {
        console.error("Error loading GitHub repository:", error);
        throw new Error("Failed to load GitHub repository. Check if the repository URL and token are correct.");
    }
};


export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    console.log(`Indexing GitHub repository: ${githubUrl} for project ID: ${projectId}`); // Log repository and project details
    try {
        const docs = await loadGithubRepo(githubUrl, githubToken);
        console.log("Loaded documents. Starting to generate embeddings...");

        const allEmbeddings = await generateEmbeddings(docs);
        console.log(`Generated ${allEmbeddings.length} embeddings.`);

        const results = await Promise.allSettled(
            allEmbeddings.map(async (embedding, index) => {
                console.log(`Processing embedding ${index + 1} of ${allEmbeddings.length}...`);
                if (!embedding) {
                    console.warn(`Skipping null embedding at index ${index}.`);
                    return;
                }

                const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                    data: {
                        summary: embedding.summary,
                        sourceCode: embedding.sourceCode,
                        fileName: embedding.fileName,
                        projectId,
                    },
                });
                console.log(`Created source code embedding with ID: ${sourceCodeEmbedding.id}`);

                await db.$executeRaw`
                UPDATE "SourceCodeEmbedding"
                SET "summaryEmbedding" = ${embedding.embedding}::vector
                WHERE "id" = ${sourceCodeEmbedding.id}
                `;
                console.log(`Updated embedding for ID: ${sourceCodeEmbedding.id}`);
            })
        );

        console.log("Finished processing all embeddings.");
        return results;
    } catch (error) {
        console.error("Error indexing GitHub repository:", error); // Log error details
        throw new Error("Failed to index GitHub repository.");
    }
};

const generateEmbeddings = async (docs: Document[]) => {
    console.log(`Generating embeddings for ${docs.length} documents...`); // Log document count
    try {
        return await Promise.all(
            docs.map(async (doc, index) => {
                console.log(`Generating summary for document ${index + 1}: ${doc.metadata.source}`); // Log document source
                const summary = await summariseCode(doc);
                console.log(`Summary generated for document ${index + 1}: ${summary}`);

                const embedding = await generateEmbedding(summary);
                console.log(`Embedding generated for document ${index + 1}.`);

                return {
                    summary,
                    embedding,
                    sourceCode: JSON.parse(JSON.stringify(doc.pageContent)), // Ensures no circular references
                    fileName: doc.metadata.source,
                };
            })
        );
    } catch (error) {
        console.error("Error generating embeddings:", error); // Log error details
        throw new Error("Failed to generate embeddings.");
    }
};
