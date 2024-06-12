"use client";

import { useEffect, useState, useContext } from "react";
import Context from '../../../../context/context';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { ArrowRight, Star, Clock, BarChart } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: number;
  name: string;
  technology: string;
  hours_to_study: number;
  rating: string;
  level: string;
  learning_path: string;
  total_modules: number;
  registered_students: number | string;
}
interface Score {
  id_user: number;
  learning_path: string;
  assessment_point: number;
}

const Result: React.FC = () => {
  const path = usePathname();
  const context = useContext(Context);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [score, setScore] = useState<Score[]>([]);
  const fetchAssessmentScore = async (learningPath: string) => {
    try {
      const response = await axios.get(`/api/score-assessment?id_user=${context?.userId}`);
      const filteredData = response.data.filter((item: any) => item.learning_path==learningPath);
      setScore(filteredData)
      return filteredData[0].assessment_point
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchCourses = async (learningPath: string, point: number) => {
    try {
      const response = await axios.get('/api/courses');
      var level = ""
      if(point>75){
        level = "PROFESSIONAL"
      } else if(point>50){
        level = "INTERMEDIATE"
      } else if(point>25){
        level = "BEGINNER"
      } else {
        level = "FUNDAMENTAL"
      }
      const filteredData = response.data.filter((item: any) => item.learning_path==learningPath && item.level==level);
      setAllCourses(filteredData);
      console.log(filteredData)
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const getData = async (path: string) => {
    const point = await fetchAssessmentScore(path)
    console.log(point)
    await fetchCourses(path, point)
  };
  useEffect(() => {
    const pathName = path.split("/")[4].replace(/%20/g, ' ')
    getData(pathName)
  }, [path]);
  return (
    <div>
      <h2 className="font-bolder text-[#1B4332] text-3xl mb-4">Anda telah berhasil menyelesaikan skill assessment!</h2>
      {score.map((item:any)=>(
        <div className="w-[300px] bg-white shadow p-4 mb-5">
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-xl font-medium">{item.learning_path}</p>
                {
                  item.assessment_point>75?<div className="rounded py-1 px-2 text-xs w-fit bg-[#26547c]">Professional</div>:
                  item.assessment_point>50?<div className="rounded py-1 px-2 text-xs w-fit bg-[#ef476f]">Intermediate</div>:
                  item.assessment_point>25?<div className="rounded py-1 px-2 text-xs w-fit bg-[#ffd166]">Beginner</div>:
                  <div className="rounded py-1 px-2 text-xs w-fit bg-[#06d6a0]">Fundamental</div>
                }
            </div>
            <p className="text-xl font-medium">{item.assessment_point}</p>
          </div>
          <Link href={`/pages/courses/${item.learning_path}`}>
            <button className="flex justify-between w-full bg-[#1B4332] text-white p-2 rounded">
                Ikuti Kelas Sekarang
                <ArrowRight />
            </button>
          </Link>
        </div>
      ))}
      <h3>Rekomendasi Course</h3>
      <div className='flex overflow-x-auto px-4'>
          {allCourses.map((course: any) => (
            <div key={course.id} className='course course-card mr-5 p-4 w-80 bg-white my-5 w-[320px]'>
              <div className='min-h-[70px]'>
                <h3 className='title'>
                  {course.name}
                </h3>
                <p className='card-path'>{course.learning_path}</p>
              </div>
              <ul className='course-stat'>
                <li>
                  <div className='flex items-center text-xs mr-3'>
                    <Clock size={20} className='mr-[0.5rem]' /> {course.hours_to_study} Jam
                  </div>
                </li>
                <li>
                  <div className='flex items-center text-xs mr-3'>
                    <Star size={20} className='mr-[0.5rem]' /> {course.rating}
                  </div>
                </li>
                <li>
                  <div className='flex items-center text-xs mr-3'>
                    <BarChart size={20} className='mr-[0.5rem]'/> {course.level}
                  </div>
                </li>
              </ul>
              <div className='flex'>
                {course.technology.split(",").map((itemTech: any, index: any) => (
                  <div key={index} className='bg-[#E1F4E8] border-[#52B788] border-2 p-1 mr-2 mt-2 rounded'>
                    <p className='leading-3 text-[#2D6A4F] font-medium'>{itemTech}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Result;