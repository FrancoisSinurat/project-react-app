"use client";

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Context from '../../context/context';
import { Star, Clock, BarChart } from 'lucide-react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

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

const CoursePage = () => {
  const context = useContext(Context);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsQuiz, setRecommendationsQuiz] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const fetchLearningPath = async () => {
    try {
      const response = await axios.get('/api/learning-path');
      setLearningPaths(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchRecommendation = async (data: any) => {
    try {
      const responseRec = await axios.post('https://rekomenin-app-model-sywxiullwa-et.a.run.app/predict-course', { user_id: context?.userId }, { headers: { 'Content-Type': 'application/json' } });
      const filteredData = data.filter((item: any) => responseRec.data.id.includes(item.id));
      var filteredIndex = 0;
      const dataWithRatings = filteredData.map((course: any) => {
        var row = { ...course, predicted_rating: responseRec.data.ratings[filteredIndex] };
        filteredIndex = filteredIndex + 1;
        return row;
      });
      setRecommendations(dataWithRatings)
      return dataWithRatings;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  };
  const fetchPreferensiScore = async () => {
    try {
      const response = await axios.get(`/api/score-preferensi?id_user=${context?.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchAssessmentScore = async () => {
    try {
      const response = await axios.get(`/api/score-assessment?id_user=${context?.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setAllCourses(response.data);
      return response.data
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const getAllData = async () => {
    const courses = await fetchCourses();
    console.log(courses)
    await fetchLearningPath();
    await fetchRecommendation(courses);
    const preferensiScore = await fetchPreferensiScore()
    const assessmentScore = await fetchAssessmentScore()
    assessmentScore.forEach((rowAssessment: any) => {
      const assessmentPoint = rowAssessment.assessment_point
      var level="";
      if (assessmentPoint != null) {
        if (assessmentPoint>75){
          level="professional"
        } else if (assessmentPoint>50){
          level="intermediate"
        } else if (assessmentPoint>25){
          level="beginner"
        } else {
          level="fundamental"
        }
          const filteredData = courses.filter((course: any) => course.level.toLowerCase()==level && course.learning_path==rowAssessment.learning_path);
          setRecommendationsQuiz(prevRecommendations => {
          const prevIds = prevRecommendations.map(item => item.id);
          const noDuplicate = filteredData.filter((newItem:any) => !prevIds.includes(newItem.id));
          return [...prevRecommendations, ...noDuplicate];
        });
      } else {
        preferensiScore.forEach((rowPreferensi: any) => {
          const preferensiPoint = rowPreferensi.preferensi_point
          if (preferensiPoint != null && rowPreferensi.learning_path==rowAssessment.learning_path) {
            const filteredData = courses.filter((course: any) => course.level.toLowerCase()=="fundamental" && course.learning_path==rowPreferensi.learning_path);
            setRecommendationsQuiz(prevRecommendations => {
              const prevIds = prevRecommendations.map(item => item.id);
              const noDuplicate = filteredData.filter((newItem:any) => !prevIds.includes(newItem.id));
              return [...prevRecommendations, ...noDuplicate];
            });
          }
        })
      }
    });
  };
  
  useEffect(() => {
    getAllData()
  }, []);

  return (
    <main>
      <div className='text-3xl h-2/6 mb-3'>
        {recommendationsQuiz.length === 0 ? (
          <div>
            <h3>Isi quiz untuk rekomendasi terbaikmu sekarang!</h3>
            <a href="/pages/courses/preferensi" className='text-sm font-bold'>
              <button className='bg-[#1B4332] text-white rounded mt-3 p-2'>
                Ikuti Quiz
              </button>
            </a>
          </div>
        ) : (
          <div className='w-full my-5'>
        Rekomendasi Course
        <div className='flex overflow-x-auto px-4'>
          {recommendationsQuiz.map((course: any) => (
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
        )}
      </div>
      <div className='w-full my-5'>
        Orang lain juga Menyukai
        <div className='flex overflow-x-auto px-4'>
          {recommendations.map((course: any) => (
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
      <div className='w-full pl-12'>
        <Carousel className='w-11/12'>
          <CarouselContent>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses'><Button className='w-5/6' variant="ghost">All</Button></Link>
            </CarouselItem>
            {learningPaths.map((item:any)=> (
              <CarouselItem className="basis-1/5 flex justify-center" key={item.learning_path_id}>
                <Link href={`/pages/courses/${item.learning_path_name}`}><Button className='w-5/6' variant="ghost">{item.learning_path_name}</Button></Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className='courses min-h-[80vh] shadow-inner rounded-[0.6rem]'>
        <div className='course-wrapper grid grid-cols-3 gap-x-0 gap-y-8 justify-items-center'>
          {allCourses.map(course => (
            <div key={course.id} className='course course-card mr-5 p-4 w-80 bg-white'>
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
                {course.technology.split(",").map((itemTech, index) => (
                  <div key={index} className='bg-[#E1F4E8] border-[#52B788] border-2 p-1 mr-2 mt-2 rounded'>
                    <p className='leading-3 text-[#2D6A4F] font-medium'>{itemTech}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CoursePage;
