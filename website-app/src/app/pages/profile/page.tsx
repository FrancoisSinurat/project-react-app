"use client";

import React, { useEffect, useState, useContext }  from 'react'
import Context from '../../context/context';
import axios from 'axios';
import { Button } from "@/components/ui/button";
interface SavedAnswer {
  id_user: number;
  id_assessment: number;
  id_answer: number;
}
const profile = () => {
  const [savedAnswer, setSavedAnswer] = useState<SavedAnswer[]>([]);
  const context = useContext(Context);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/saved-answer?id_user=${context?.userId}`);
        setSavedAnswer(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);
  return (
    <div>profile</div>
  )
}

export default profile