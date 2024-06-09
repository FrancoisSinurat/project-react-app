"use client"
import axios from 'axios';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        await axios.post('http://localhost:5000/predict-job', { user_id: 401 }, { headers: { 'Content-Type': 'application/json' } })
        .then((response) => {
          setRecommendations(response.data);
          console.log(response.data)
        })
        .catch((error) => {
          console.error(error);
        });;
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
