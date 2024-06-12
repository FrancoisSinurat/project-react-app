"use client"
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import Context from '../../context/context';
import { log } from 'console';
interface Job {
  id: number;
  position: string;
  company: string;
  description: string;
  minimum_job_experience: string;
  talent_quota: number;
  job_type: string;
  location: string;
}
interface JobRec {
  id: number;
  position: string;
  company: string;
  description: string;
  minimum_job_experience: string;
  talent_quota: number;
  job_type: string;
  location: string;
  similiarity: number;
}
const Jobs = () => {
  const context = useContext(Context);
  const [recommendations, setRecommendations] = useState<JobRec[]>([]);
  const [ratings, setRatings] = useState([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs')
      setAllJobs(response.data);
      return response.data

    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchRated = async () => {
    try {
      const response = await axios.get(`/api/ratings?id_user=${context?.userId}`);
      setRatings(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };
  const fetchRecommendation = async (data: any) => {
    try {
      await axios.post('https://rekomenin-app-model-sywxiullwa-et.a.run.app/predict-job', { user_id: context?.userId }, { headers: { 'Content-Type': 'application/json' } })
      .then((responseRec) => {
        const filteredData = data.filter((item: any) => responseRec.data.id.includes(item.id));
        var filteredIndex = 0
        const dataWithSimiliarity = filteredData.map((course: any) => {
          var row = { ...course, similiarity: responseRec.data.similiarity[filteredIndex] }
          filteredIndex = filteredIndex + 1
          return row;
        });
        console.log(dataWithSimiliarity)
        setRecommendations(dataWithSimiliarity)
      })
      .catch((error) => {
        console.error(error);
      });;
    } catch (error) {
      console.log("Error fetching recommendations:", error);
    }
  };
  const getAllData = async () => {
    await fetchRated()
    const jobs = await fetchJobs();
    await fetchRecommendation(jobs)
  };
  useEffect(() => {
    getAllData()
  }, []);
  console.log()
  return (
    <div>
      <div>
      {ratings.length == 0?
        <p>Ambil course untuk dapatkan rekomendasi sekarang!</p>:
        <div>
          <p>Rekomendasi Job</p>
          <div className='flex overflow-x-scroll'>
            {recommendations.map((item) => (
              <div key={item.id} className='course course-card mr-5 p-4 bg-white my-5 w-[320px]'>
                <div className='min-h-[70px]'>
                  <h3 className='title'>
                    {item.position}
                  </h3>
                  <p className='card-path'>{item.company}</p>
                </div>
                <div className='flex justify-between'>
                  <p>{item.location}</p>
                  <p>{item.minimum_job_experience=="freshgraduate"?"Freshgraduate":
                      item.minimum_job_experience=="one_to_three_years"?"1 - 3 Tahun":
                      item.minimum_job_experience=="four_to_five_years"?"4 - 5 Tahun":
                      item.minimum_job_experience=="five_to_ten_years"?"5 - 10 Tahun":
                      "10+ Tahun"
                    }</p>
                </div>
              </div>
            ))}  
          </div>
        </div>
      }
      </div>
      <div>
        <div className='grid grid-cols-3'>
          {recommendations.map((item) => (
            <div key={item.id} className='course course-card mr-5 p-4 bg-white my-5 w-[320px]'>
              <div className='min-h-[70px]'>
                <h3 className='title'>
                  {item.position}
                </h3>
                <p className='card-path'>{item.company}</p>
              </div>
              <div className='flex justify-between'>
                <p>{item.location}</p>
                <p>{item.minimum_job_experience=="freshgraduate"?"Freshgraduate":
                    item.minimum_job_experience=="one_to_three_years"?"1 - 3 Tahun":
                    item.minimum_job_experience=="four_to_five_years"?"4 - 5 Tahun":
                    item.minimum_job_experience=="five_to_ten_years"?"5 - 10 Tahun":
                    "10+ Tahun"
                  }</p>
              </div>
            </div>
          ))}  
        </div>
      </div>
    </div>
  );
};

export default Jobs;
