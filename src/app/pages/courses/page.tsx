"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setAllCourses(response.data);

        const level = localStorage.getItem("level");
        const learning_path = localStorage.getItem("learning_path");

        if (level && learning_path) {
          const recommended = response.data.filter((course: Course) =>
            course.level === level && course.learning_path === learning_path
          ).slice(0, 3);
          setRecommendedCourses(recommended);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <main>
      <div className='text-3xl h-2/6 mb-3'>
        {recommendedCourses.length === 0 ? (
          <button>
            <a href="/pages/courses/preferensi">Isi quiz dulu yuk untuk dapat rekomendasi!</a>
          </button>
        ) : (
          <div className='recommended-courses p-5'>
            <h2 className='title pri-c mb-3'>Rekomendasi Courses:</h2>
            <div className='grid grid-cols-3 gap-x-0 gap-y-8 justify-items-center'>
              {recommendedCourses.map(course => (
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
        )}
      </div>
      <div className='w-full pl-12'>
        <Carousel className='w-11/12'>
          <CarouselContent>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses'><Button className='w-5/6' variant="ghost">All</Button></Link>
            </CarouselItem>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses/1'><Button className='w-5/6' variant="ghost">Machine Learning</Button></Link>
            </CarouselItem>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses/2'><Button className='w-5/6' variant="ghost">Android</Button></Link>
            </CarouselItem>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses/3'><Button className='w-5/6' variant="ghost">IOS</Button></Link>
            </CarouselItem>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses/4'><Button className='w-5/6' variant="ghost">Multi-Platform App</Button></Link>
            </CarouselItem>
            <CarouselItem className="basis-1/5 flex justify-center">
              <Link href='/pages/courses/5'><Button className='w-5/6' variant="ghost">Data Science</Button></Link>
            </CarouselItem>
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
