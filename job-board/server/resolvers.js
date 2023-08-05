import { getJobs, getJob, deleteJob, updateJob, getJobsByCompany, createJob, countJobs } from './db/jobs.js';
import { getCompany } from './db/companies.js';
import { GraphQLError } from 'graphql';

export const resolvers = {
    Query: {
        company: async (_root, { id }) => {
            const company = await getCompany(id);
            if(!company) {
                throw notFoundError('No company found with id ' + id);
            }

            return company;
        },
        job: async (_root, { id }) => {
            const job = await getJob(id);
            if(!job){
                throw notFoundError('No job found with id ' + id);
            }

            return job;
        },
        jobs: async (_root, { limit, offset}) => {
            const items = await getJobs(limit, offset);
            const totalCount = await countJobs();
            return { items, totalCount }
        }
    },

    Mutation: {
        createJob:  async (_root, { input: { title, description} }, { user }) => {
            if(!user){
                throw unAuthenicated('missing authenicate beer token');
            }
            const companyId = user.companyId;
            const job = await createJob({title,description, companyId})
            return job;
        },
        deleteJob: async (_root, { id }, { user }) => {
            if(!user){
                throw unAuthenicated('missing authenicate beer token');
            }

            const job = await deleteJob(id, user.companyId);
            if(!job) {
                throw notFoundError('No job found with id ' + id);
            }

            return job;
        } ,

        updateJob: async (_root, { input: { id, title, description} }, { user }) => {
            if(!user){
                throw unAuthenicated('missing authenicate beer token');
            }
            const companyId = user.companyId;
            
            const job = await updateJob({id, title, description, companyId})
            if(!job) {
                throw notFoundError('No job found with id ' + id);
            }
        }
        
    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id)
    },

    Job: {
        company: (job, _args, { companyLoader }) =>{
            return companyLoader.load(job.companyId);
        },
        date: (job) => toIsoDate(job.createdAt)
    }
   
}

function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: { code: 'NOT FOUND'}
    })
}

function unAuthenicated(message) {
    return new GraphQLError(message, {
        extensions: { code: 'UN AUTHENICATED'}
    })
}

function toIsoDate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}