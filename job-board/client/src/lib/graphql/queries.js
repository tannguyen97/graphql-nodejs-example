import { ApolloClient, ApolloLink, concat, createHttpLink, gql, InMemoryCache } from '@apollo/client';
import { getAccessToken } from '../auth';

const httpLink = createHttpLink({uri: 'http://localhost:9000/graphql'});
const authLink = new ApolloLink((opertaion, forward) => {
    const accessToken = getAccessToken();
    if(accessToken) { 
        opertaion.setContext({
            headers: { 'Authorization': `Bearer ${accessToken}`}
        });
    }       
    return forward(opertaion);
})

export const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    cache: new InMemoryCache()
})

const jobDetailFragment = gql`
    fragment jobDetail on Job {
        id
        date
        title
        company {
            id
            name
            description
        }
        description
    }
`

export const queryJobById = gql`
    query JobById($id: ID!){
        job(id: $id) {
            ...jobDetail
        }
    }
    ${jobDetailFragment}
`

export const queryCompanyId = gql`
    query CompanyById($id: ID!){
        company(id: $id) {
            id
            name
            description
            jobs {
                id
                date
                title
                description
            }
        }
    }
`

export const queryJobs = gql`
    query ($limit: Int, $offset: Int){
        jobs(limit: $limit, offset: $offset){
            items {
                description
                id
                title
                date
                company {
                    id
                    name
                    description
                }
            }
            totalCount
        }
    }
`

export const mutationCreateJob = gql`
    mutation CreateJob($input: CreateJob!) {
        job: createJob(input: $input) {
            ...jobDetail
        }
    }
    ${jobDetailFragment}
`

export const creatJob = async ({title, description}) => {
    const { data } = await apolloClient.mutate({
        mutation: mutationCreateJob,
        variables: {input: { title, description }},
        update: (cache, {data}) => {
            cache.writeQuery({
                query: queryJobById,
                variables: { id: data.job.id },
                data
            })
        }
    })
    return data.job;
}

export const getCompany = async (id) => {
    
    const { data } = await apolloClient.query({
        query: queryCompanyId, 
        variables: { id }
    })
    return data.company;
}

export const getJob = async (id) => {
    const { data } = await apolloClient.query({
        query: queryJobById, 
        variables: { id }
    })
    return data.job;
}

export const getJobs = async () => {
    const result = await apolloClient.query({
        query: queryJobs,
        fetchPolicy: 'network-only'
    })
    return result.data.jobs;
}