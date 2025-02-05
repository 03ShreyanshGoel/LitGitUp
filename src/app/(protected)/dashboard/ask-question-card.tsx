'use-client'
import MDEditor from "@uiw/react-md-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project"
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";


const AskQuestionCard = () => {
    const { project } = useProject();
    const [open, setOpen] = React.useState(false);
    const [question, setQuestion] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [answer, setAnswer] = React.useState('');
    const [filesReferences, setFilesReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[] | null>(null);
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAnswer('');
        setFilesReferences(null);

        if (!project?.id) return; // Ensure there is a question and a project ID

        setLoading(true);
        setOpen(true);

        try {
            const { output, filesReferences } = await askQuestion(question, project.id);
            setFilesReferences(filesReferences);
            let answerContent = '';
            for await (const delta of readStreamableValue(output)) {
                if (delta) {
                    answerContent += delta;
                }
            }
            setAnswer(answerContent);
        } catch (error) {
            setAnswer("There was an error processing your request. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    const refetch = useRefetch();
    return (
        <>
            {/* Dialog Component */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[96vw] max-h-[100vh]
                        sm:max-w-[80vw]
                        sm:max-h-[100vh]
                        md:max-w-[70vw]
                        md:max-h-[100vh] overflow-auto ">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                <Image src='/logo.png' alt="LitGitUp" width={40} height={40} />
                            </DialogTitle>
                            <Button className="mx-4 text-white bg-primary"
                                disabled={saveAnswer.isPending}
                                variant="outline"
                                onClick={() =>
                                    saveAnswer.mutate(
                                        {
                                            projectId: project!.id,
                                            question,
                                            answer,
                                            filesReferences,
                                        },
                                        {
                                            onSuccess: () => {
                                                toast.success('Answer saved!')
                                                refetch()
                                            },
                                            onError: () => { toast.error('Failed to save answer!') },
                                        }
                                    )
                                }
                            >
                                Save Answer
                            </Button>
                        </div>
                    </DialogHeader>
                    <MDEditor.Markdown
                        source={answer}
                        className="
                        max-w-[85vw] max-h-[30vh]
                        sm:max-w-[70vw]
                        sm:max-h-[30vh]
                        md:max-w-[68vw] 
                        md:max-h-[30vh] overflow-auto"
                    />
                    {/* <div className="h-4"></div> */}
                    {filesReferences && <CodeReferences filesReferences={filesReferences}></CodeReferences>}
                    {/* <div className="h-4"></div> */}
                    <Button type="button" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogContent>

            </Dialog>

            {/* Card for Question Input */}
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea
                            placeholder="Which file should I edit to change the home page?"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            disabled={loading} // Disable textarea when loading
                        />
                        <div className="h-4"></div>
                        {/* Submit Button inside the form */}
                        <Button type="submit" disabled={loading}>Ask LitGitUp!</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard;
