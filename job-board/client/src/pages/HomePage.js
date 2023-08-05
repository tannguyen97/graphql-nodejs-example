import { useState } from 'react';
import JobList from '../components/JobList';
import { useJobs } from '../lib/graphql/hook';
import PaginationBar from '../components/PaginationBar';
const ITEM_PER_PAGE = 5;

function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { jobs } = useJobs(ITEM_PER_PAGE, (currentPage - 1)*ITEM_PER_PAGE);
  const totalPages = Math.ceil(jobs.totalCount/ITEM_PER_PAGE);
  console.log(jobs);
  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs?.items || []} />
      <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
      
    </div>
  );
}

export default HomePage;
