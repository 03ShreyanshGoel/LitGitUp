import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini";
import axios from "axios";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commmitDate: string;
};

export const getCommitHashes = async (github: string): Promise<Response[]> => {
    const [owner, repo] = github.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL");
    }

    const { data } = await octokit.rest.repos.listCommits({ owner, repo });
    const sortedCommits = data.sort((a: any, b: any) =>
        new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
    );
    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? '',
        commitAuthorName: commit.commit?.author?.name ?? '',
        commitAuthorAvatar: commit?.author?.avatar_url ?? '',
        commmitDate: commit.commit?.author?.date ?? '',
    }));
};

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(async (commit) => {
        return summariseCommit(githubUrl, commit.commitHash);
    }));

    const summaries = summaryResponses.map((response) =>
        response.status === "fulfilled" ? response.value as string : ""
    );

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log(`processing commit ${index}`)
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commmitDate,
                summary,
            }
        }
        ),
    });
    return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
    try {
        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: { Accept: 'application/vnd.github.v3.diff' },
        });
        console.log("difference :", data)
        return aiSummariseCommit(data) || "";
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to fetch diff for commit ${commitHash}:`, error.message);
        } else {
            console.error(`Failed to fetch diff for commit ${commitHash}:`, error);
        }
        return `Error summarizing commit ${commitHash}`;
    }
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { githubUrl: true },
    });
    if (!project?.githubUrl) {
        throw new Error("Project has no GitHub URL");
    }
    return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true },
    });
    return commitHashes.filter((commit) =>
        !processedCommits.some((processed) => processed.commitHash === commit.commitHash)
    );
}
