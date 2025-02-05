import { api } from '@/trpc/react';
import { useLocalStorage } from 'usehooks-ts';

const useProject = () => {
    console.log(api);
    console.log(api.project);
    const { data: projects } = api.project.getProjects.useQuery();
    const [projectId, setProjectId] = useLocalStorage('lit-git-up-projectId', '');
    const project = projects?.find((project) => project.id === projectId);

    return { projects, project, projectId, setProjectId };
};

export default useProject;
