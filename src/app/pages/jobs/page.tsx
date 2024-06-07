"use client"
import axios from 'axios';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.post('http://localhost:5000/predict', {user_id: 1779449,});
        setRecommendations(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div>
      test
    </div>
  );
};

export default MyComponent;
