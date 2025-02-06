"use client"
import React from "react";
import { useDropzone } from "react-dropzone";
import axios, { AxiosProgressEvent } from "axios";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Presentation, Upload } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useProject from "@/hooks/use-project";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import useRefetch from "@/hooks/use-refetch";

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;

interface UploadFileProps {
    file: File;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}

async function uploadFile({ file, setProgress }: UploadFileProps): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET!);
    formData.append("folder", CLOUDINARY_FOLDER!);

    try {
        const response = await axios.post(CLOUDINARY_URL, formData, {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            },
        });
        return response.data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Upload failed");
    }
}

const MeetingCard = () => {
    const project = useProject();
    const refetch = useRefetch();
    const router = useRouter();
    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const processMeeting = useMutation({
        mutationFn: async ({ meetingUrl, meetingId, projectId }: { meetingUrl: string, meetingId: string, projectId: string }) => {
            const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId });
            return response.data;
        }
    });

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'audio/*': ['.mp3', '.wav', '.mp4'] },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) {
                toast.error("No file selected. Please try again.");
                return;
            }
            setIsUploading(true);
            const downloadUrl = await uploadFile({ file, setProgress });
            uploadMeeting.mutate({
                projectId: project.projectId,
                meetingUrl: downloadUrl,
                name: file.name,
            }, {
                onSuccess: async (meeting) => {
                    toast.success("Meeting uploaded successfully");
                    await processMeeting.mutateAsync({
                        meetingUrl: downloadUrl,
                        meetingId: meeting.id,
                        projectId: project.projectId
                    });
                    refetch();
                    router.push("/meetings");
                },
                onError: () => {
                    toast.error("Failed to upload meeting");
                }
            });
            setIsUploading(false);
        },
    });

    return (
        <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
            {!isUploading ? (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Upload a New Meeting</h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyze your meeting with LitGitUp.
                        <br /> Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-6" aria-hidden="true" />
                            Upload Your Meeting
                            <input className="hidden" {...getInputProps()} />
                        </Button>
                    </div>
                </>
            ) : (
                <div>
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        className="size-20"
                        styles={buildStyles({
                            pathColor: '#000000',
                            textColor: '#000000',
                        })}
                    />
                    <p className="text-sm text-gray-500 text-center">Uploading your meeting</p>
                </div>
            )}
        </Card>
    );
};
export default MeetingCard;
