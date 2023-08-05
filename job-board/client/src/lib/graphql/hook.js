import { queryJobById, queryCompanyId, queryJobs, mutationCreateJob } from './queries';
import { useMutation, useQuery } from '@apollo/client';

export function useCompany(id) {
    const { data, loading, error } = useQuery(queryCompanyId, {
        variables: { id }
    });

    return { company: data?.company, loading, error: Boolean(error)};
}

export function useJob(id) {
    const { data, loading, error } = useQuery(queryJobById, {
        variables: { id }
    });

    return { job: data?.job, loading, error: Boolean(error)};
}

export function useJobs(limit, offset) {
    const { data, loading, error } = useQuery(queryJobs, {
        variables: { limit, offset}
    });

    return { jobs: data?.jobs || [], loading, error: Boolean(error)};
}

export function useCreateJob() {
    const [mutate, { loading , error}] = useMutation(mutationCreateJob);
    const createJob = async (title, description) => {
        const { data: { job } } = await mutate({
            variables: { input: { title, description } },
            update: (cache, { data }) => {
                cache.writeQuery({
                    query: queryJobById,
                    variables: { id: data.job.id },
                    data
                })
            }
        });

        return job;
    }

    console.log( error);

    return { createJob, loading };
}