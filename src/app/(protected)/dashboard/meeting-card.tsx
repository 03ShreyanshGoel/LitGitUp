"use client"
import React from "react";
import { useDropzone } from "react-dropzone";
import axios, { AxiosProgressEvent } from "axios";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Presentation, Upload } from "lucide-react";
import { api } from "@/trpc/react"; // Adjust the import path as necessary
import { toast } from "sonner";
import useProject from "@/hooks/use-project";
import { useRouter } from "next/navigation";
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

    return new Promise((resolve, reject) => {
        axios.post(CLOUDINARY_URL, formData, {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            },
        })
            .then(response => resolve(response.data.secure_url))
            .catch(error => {
                console.error("Cloudinary upload error:", error);
                reject(error);
            });
    });
}

const MeetingCard = () => {
    const project = useProject();
    const router = useRouter()
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0);
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'audio/*': ['.mp3', '.wav', '.mp4'] },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            const file = acceptedFiles[0];
            if (!file) {
                window.alert("It looks like you didn't select a file. Please try again.");
                setIsUploading(false);
                return;
            }
            try {
                const downloadUrl = await uploadFile({ file, setProgress });
                uploadMeeting.mutate({
                    projectId: project.projectId,
                    meetingUrl: downloadUrl,
                    name: file.name,
                }, {
                    onSuccess: () => {
                        toast.success("Meeting uploaded successfully")
                        router.push("/meetings")
                    },
                    onError: () => {
                        toast.error("Failed to upload meeting")
                    }
                })
                window.alert(`Your file has been uploaded successfully! You can view it here: ${downloadUrl}`);
            } catch (error) {
                console.error("Upload failed", error);
                window.alert("There was an error uploading your file. Please try again later.");
            }
            setIsUploading(false);
        },
    });

    return (
        <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
            {!isUploading && (
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
            )}
            {isUploading && (
                <div className="">
                    <CircularProgressbar value={progress} text={`${progress}%`} className="size-20" styles={buildStyles({
                        pathColor: '#000000',
                        textColor: '#000000',
                    })} />
                    <p className="text-sm text-gray-500 text-center">Uploading your meeting</p>
                </div>
            )}
        </Card>
    );
};

export default MeetingCard;


