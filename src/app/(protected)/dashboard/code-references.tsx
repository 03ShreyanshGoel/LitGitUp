'use client'
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
type Props = {
    filesReferences: { fileName: string; sourceCode: string; summary: string }[]
}
const CodeReferences = ({ filesReferences }: Props) => {
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName)
    if (filesReferences.length === 0) return null;
    return (
        <div className="max-w-[82vw] max-h-[40vh]
                        sm:max-w-[72vw]
                        sm:max-h-[40vh]
                        md:max-w-[68vw] 
                        md:max-h-[40vh] ">
            <Tabs value={tab} onValueChange={setTab}>
                <div className="overflow-auto flex gap-2 bg-gray-200 p-1 rounded-md">
                    {filesReferences.map((file) => (
                        <button onClick={() => setTab(file.fileName)} key={file.fileName} className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted', {
                            'bg-primary text-primary-foreground': tab === file.fileName,

                        })}>{file.fileName}</button>
                    ))}
                </div>
                {filesReferences.map(file => (
                    <TabsContent key={file.fileName} value={file.fileName} className="max-w-[80vw] max-h-[30vh]
                        sm:max-w-[68vw]
                        sm:max-h-[30vh]
                        md:max-w-[66vw] 
                        md:max-h-[30vh] overflow-auto  rounded-md">
                        <SyntaxHighlighter language='typescript' style={nightOwl}>
                            {file.sourceCode}
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeReferences
