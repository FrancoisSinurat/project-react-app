"use client";

import React, { useEffect, useState, useContext } from 'react';
import Context from '../../context/context';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Rating {
  id_rating: number;
  course_id: number;
  respondent_identifier: number;
  course_name: string;
  rating: number;
}
interface Score {
  id_user: number;
  learning_path: string;
  assessment_point: number;
}
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
interface GroupedData {
  [key: string]: number;
}

const Profile = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [countCourses, setCountCourses] = useState<GroupedData>({});
  const [countRated, setCountRated] = useState<GroupedData>({});
  const context = useContext(Context);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchRated = async () => {
    try {
      const response = await axios.get(`/api/ratings?id_user=${context?.userId}`);
      setRatings(response.data)
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchAssessmentScore = async () => {
    try {
      const response = await axios.get(`/api/score-assessment?id_user=${context?.userId}`);
      const filteredData = response.data.filter((item: any) => item.assessment_point != null);
      setScores(filteredData);
      console.log(filteredData)
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const groupDataByLearningPath = (data: Course[]) => {
    return data.reduce((acc: GroupedData, curr: Course) => {
      const path = curr.learning_path;
      if (!acc[path]) {
        acc[path] = 0;
      }
      acc[path]++;
      return acc;
    }, {});
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  const getAllData = async () => {
    await fetchAssessmentScore();
    const courses = await fetchCourses();
    const rated = await fetchRated();
    const ratedCourseIds = new Set(rated.map((rating: Rating) => rating.course_id));
    const ratedCourses = courses.filter((course: Course) => ratedCourseIds.has(course.id));
    const grouped = groupDataByLearningPath(courses);
    const groupedRated = groupDataByLearningPath(ratedCourses);
    setCountCourses(grouped);
    setCountRated(groupedRated);
  };

  useEffect(() => {
    getAllData();
  }, []);

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <p className='mb-4'>User ID : {context?.userId}</p>
        <h2 className='text-lg font-bold'>User Progress</h2>
        <div className='grid grid-cols-4 gap-4 mb-8'>
          {Object.keys(countCourses).map((learningPath) => {
            const completedCourses = countRated[learningPath] || 0;
            const total = countCourses[learningPath];
            const progress = getProgressPercentage(completedCourses, total);

            return (
              <div key={learningPath} className="mb-4">
                <div className="grid grid-cols-12 mb-1">
                  <div className='col-span-10'><span className="font-medium">{learningPath}</span></div>
                  <div className='col-span-2'><span>{completedCourses} / {total}</span></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">{Math.round(progress)}%</div>
              </div>
            );
          })}
        </div>
        <h2 className='text-lg font-bold mb-4'>Skill Assessment History</h2>
        {scores.map((item:any)=>(
        <div className="w-[300px] bg-white shadow p-4 mb-5" key={item.id}>
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
          <Link href={`/pages/courses/review/${item.learning_path}`}>
            <button className="flex justify-between w-full bg-[#1B4332] text-white p-2 rounded">
                Lihat Ulasan
                <ArrowRight />
            </button>
          </Link>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Profile;
