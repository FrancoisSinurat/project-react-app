"use client";

import { useState, useEffect, useContext } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import Context from '../../../../context/context';
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import React from "react";

interface Question {
  id_assessment: number;
  question: string;
  learning_path: string;
  level: string;
}

interface Answer {
  id_answer: number;
  id_assessment: number;
  point: number;
  text: string;
  learning_path: string;
}

interface AnswerState {
  [key: string]: string;
}

interface FormValues {
  answers: {
    [key: string]: string;
  };
}

interface SavedAnswer {
  id_user: number;
  id_assessment: number;
  id_answer: number;
}

const SkillAssessment: React.FC = () => {
  const [savedAnswer, setSavedAnswer] = useState<SavedAnswer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const context = useContext(Context);
  const methods = useForm<FormValues>({
    defaultValues: {
      answers: {},
    },
  });
  const router = useRouter();
  const path = usePathname().split("/")[4].replace(/%20/g, ' ');

  const fetchDataQuestion = async () => {
    try {
      const questionsResponse = await axios.get(`/api/skill-assessment?learning_path=${path}`);
      const answersResponse = await axios.get(`/api/answer-assessment?learning_path=${path}`);

      const filteredQuestions = questionsResponse.data.filter((question: Question) => question.learning_path === path);
      setQuestions(filteredQuestions);
      console.log(filteredQuestions)
      const filteredAnswers = answersResponse.data.filter((answer: Answer) =>
        answer.learning_path === path
      );
      setAnswers(filteredAnswers);

      const initialAnswers: AnswerState = {};
      filteredQuestions.forEach((question: Question) => {
        initialAnswers[question.id_assessment.toString()] = "";
      });
      methods.reset({ answers: initialAnswers });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSaved = async () => {
    try {
      const response = await axios.get(`/api/saved-answer?id_user=${context?.userId}`);
      setSavedAnswer(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching saved answers:', error);
    }
  };

  const getAllData = async () => {
    const saved = await fetchSaved();
    await fetchDataQuestion();

    // Set default values for the answers
    const defaultValues = saved.reduce((acc: any, cur: any) => {
      acc[cur.id_assessment] = cur.id_answer.toString();
      return acc;
    }, {});

    methods.reset({ answers: defaultValues });
  };

  useEffect(() => {
    getAllData();
  }, [methods, router, path]);

  const handleNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

  const handlePrevious = () => {
    if (api) {
      api.scrollPrev();
    }
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form className="space-y-6">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {questions.map((question, index) => {
                const selectedAnswer = savedAnswer.find(sa => sa.id_assessment === question.id_assessment)?.id_answer;
                const selectedAnswerObject = answers.find(answer => answer.id_answer === selectedAnswer);
                const isCorrect = selectedAnswerObject?.point === 1;

                return (
                  <CarouselItem key={question.id_assessment}>
                    <div className="border-[#52B788] border-2 px-4 py-5 rounded-xl">
                      <b>Question {index + 1}</b>
                      <p>{question.question}</p>
                    </div>
                    <FormControl>
                      <Controller
                        name={`answers.${question.id_assessment}`}
                        control={methods.control}
                        defaultValue={selectedAnswer?.toString() || ""}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            {answers
                              .filter((answer) => answer.id_assessment === question.id_assessment)
                              .map((answer) => (
                                <FormItem
                                  key={answer.id_answer}
                                  className={`flex flex-row items-start space-x-3 space-y-0 rounded drop-shadow-md px-10 py-4 my-2 ${
                                    answer.id_answer === selectedAnswer
                                      ? answer.point === 1
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                      : 'bg-white'
                                  }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem 
                                      value={answer.id_answer.toString()} 
                                      checked={field.value === answer.id_answer.toString()}
                                      disabled={true}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>{answer.text}</FormLabel>
                                  </div>
                                </FormItem>
                              ))}
                          </RadioGroup>
                        )}
                      />
                    </FormControl>
                    {/* Tambahkan keterangan level dan apakah jawaban benar atau salah */}
                    <div className={`${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrect ? `Pertanyaan ${question.level} terjawab benar` : `Pertanyaan ${question.level} terjawab salah`}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-between">
            <Button type="button" onClick={handlePrevious} className="bg-white drop-shadow-md rounded">
              Previous
            </Button>
            <Button type="button" onClick={handleNext} className="bg-white drop-shadow-md rounded">
              Next
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SkillAssessment;
