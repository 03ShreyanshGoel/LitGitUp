'use-client'
import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'


const MeetingsPage = () => {
    const { projectId } = useProject()
    const { data: meetings } = api.project.getMeetings.useQuery({ projectId })
    return (
        <div>
            jjnjnj
        </div>
    )
}

export default MeetingsPage
