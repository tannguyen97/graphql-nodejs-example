import { useParams } from 'react-router';
import JobList from '../components/JobList';
import { useCompany } from '../lib/graphql/hook';

function CompanyPage() {
  const { companyId } = useParams();
  const { company } = useCompany(companyId)

  if(!company) return <div>Loading ...</div>
  return (
    <div>
      <h1 className="title">
        {company.name}
      </h1>
      <div className="box">
        {company.description}
      </div>
      <JobList jobs={company.jobs}/>
    </div>
  );
}

export default CompanyPage;
