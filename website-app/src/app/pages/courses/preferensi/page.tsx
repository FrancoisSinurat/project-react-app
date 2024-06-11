"use client";

import { useState, useEffect, useContext } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import Context from '../../../context/context';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import axios from "axios";

interface AnswerState {
  [key: string]: {
    [key: string]: boolean;
  };
}

interface Question {
  id_preferensi: number;
  question: string;
}

interface Answer {
  id_answer: number;
  id_preferensi: number;
  point: number;
  text: string;
  learning_path: string;
}

interface FormValues {
  answers: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}

const Preferensi: React.FC = () => {
  const context = useContext(Context);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
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

  const methods = useForm<FormValues>({
    defaultValues: {
      answers: {},
    },
  });

  const [allQuestion, setAllQuestion] = useState<Question[]>([]);
  const [allAnswer, setAllAnswer] = useState<Answer[]>([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const responseQuestion = await axios.get("/api/preferensi");
        setAllQuestion(responseQuestion.data);
        const responseAnswer = await axios.get("/api/answer-preferensi");
        setAllAnswer(responseAnswer.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchQuestion();
    console.log(allQuestion);
  }, []);

  const [answers, setAnswers] = useState<AnswerState>(() => {
    const initialAnswers: AnswerState = {};
    allQuestion.forEach((question) => {
      initialAnswers[question.id_preferensi.toString()] = {};
      allAnswer
        .filter((answer: Answer) => answer.id_preferensi === question.id_preferensi)
        .forEach((answer) => {
          initialAnswers[question.id_preferensi.toString()][answer.id_answer.toString()] = false;
        });
    });
    return initialAnswers;
  });

  const handleCheckboxChange = (questionId: string, answerId: string) => (checked: boolean) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: {
        ...prevAnswers[questionId],
        [answerId]: checked,
      },
    }));
  };

  const router = useRouter();

  const onSubmit = (event: React.FormEvent, data: FormValues) => {
    event.preventDefault();
    const scores = calculateScores(data.answers);
    const topScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    topScores.forEach(([key, value]) => {
      const postData = {
        id_user: context?.userId,
        learning_path: key,
        preferensi_point: value,
      };
      axios
        .post("/api/score-preferensi", postData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    router.push("/pages/courses/rekomendasi");
  };

  const calculateScores = (answers: { [key: string]: { [key: string]: boolean } }) => {
    const scores: { [key: string]: number } = {};

    allQuestion.forEach((question) => {
      allAnswer
        .filter((answer: Answer) => answer.id_preferensi === question.id_preferensi)
        .forEach((answer) => {
          if (answers[question.id_preferensi]?.[answer.id_answer]) {
            const paths = answer.learning_path.split(", ");
            paths.forEach((path) => {
              if (!scores[path]) scores[path] = 0;
              scores[path] += answer.point;
            });
          }
        });
    });

    return scores;
  };

  useEffect(() => {
    methods.reset({ answers });
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [answers, methods, api]);

  return (
    <div>
      <h2 className="font-bolder text-[#1B4332] text-3xl mb-4">Preferensi Quiz</h2>
      <FormProvider {...methods}>
        <form className="space-y-6">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {allQuestion.map((question) => (
                <CarouselItem key={question.id_preferensi}>
                  <div className="border-[#52B788] border-2 px-4 py-5 rounded-xl">
                    <b>Question {current + 1}</b>
                    <p>{question.question}</p>
                  </div>
                  {allAnswer
                    .filter((answer: Answer) => answer.id_preferensi === question.id_preferensi)
                    .map((answer) => (
                      <FormItem
                        key={answer.id_answer}
                        className="flex flex-row items-start space-x-3 space-y-0 rounded drop-shadow-md px-10 py-4 my-2 bg-white"
                      >
                        <FormControl>
                          <Controller
                            name={`answers.${question.id_preferensi.toString()}.${answer.id_answer.toString()}`}
                            control={methods.control}
                            defaultValue={
                              answers?.[question.id_preferensi.toString()]?.[answer.id_answer.toString()]
                            }
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={(checked) => {
                                  const isChecked = typeof checked === "boolean" ? checked : false;
                                  field.onChange(isChecked);
                                  handleCheckboxChange(
                                    question.id_preferensi.toString(),
                                    answer.id_answer.toString()
                                  )(isChecked);
                                }}
                              />
                            )}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{answer.text}</FormLabel>
                        </div>
                      </FormItem>
                    ))}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-between">
            <Button type="button" onClick={handlePrevious} className="bg-white drop-shadow-md rounded">
              Previous
            </Button>
            {current === allQuestion.length - 1 ? (
              <Button
                type="button"
                onClick={(event) => methods.handleSubmit((data) => onSubmit(event, data))(event)}
                className=""
              >
                Submit
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} className="bg-white drop-shadow-md rounded">
                Next
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Preferensi;
