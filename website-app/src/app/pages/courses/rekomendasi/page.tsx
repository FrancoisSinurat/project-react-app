"use client";

import { useEffect, useState, useContext } from "react";
import Context from '../../../context/context';
import { useRouter } from "next/navigation";
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const Rekomendasi: React.FC = () => {
  const [topPaths, setTopPaths] = useState<string[]>([]);
  const router = useRouter();
  const context = useContext(Context);

  useEffect(() => {
    const fetchUserPaths = async () => {
      try {
        const response = await axios.get(`/api/score-preferensi?id_user=${context?.userId}`);
        const userPaths = response.data;
        console.log(response.data)
        setTopPaths(userPaths.map((path: { learning_path: string }) => path.learning_path));
      } catch (error) {
        console.error("Error fetching user learning paths:", error);
      }
    };

    fetchUserPaths();
  }, []);

  const handlePathClick = (path: string) => {
    localStorage.setItem('selectedLearningPath', path);
    router.push("/pages/courses/skill-assessment");
  };

  return (
    <div className="space-y-6">
      <h1>Rekomendasi Learning Path</h1>
      <div className="grid grid-flow-col auto-cols-max">
        {topPaths.map((path, index) => (
          <Link href={`/pages/courses/quiz/${path}`} key={index}>
            <button className="flex bg-[#FAC19E] p-3 mr-4 w-72 items-center justify-between rounded-lg">
              <p className="m-0">{path}</p>
              <ArrowRight/>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Rekomendasi;