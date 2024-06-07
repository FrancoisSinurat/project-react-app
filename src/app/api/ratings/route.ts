import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM ratings", (err: any, results: []) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    console.log(results);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(request: {
  json: () =>
    | PromiseLike<{
        respondent_identifier: any;
        course_name: any;
        rating: any;
      }>
    | {
        respondent_identifier: any;
        course_name: any;
        rating: any;
      };
}) {
  try {
    const { respondent_identifier, course_name, rating } = await request.json();

    console.log(respondent_identifier, course_name, rating);

    const result = await db.query("INSERT INTO learning-path SET ?", {
      respondent_identifier,
      course_name,
      rating,
    });

    return NextResponse.json({
      respondent_identifier,
      course_name,
      rating,
      id: result.insertId,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error },
      {
        status: 500,
      }
    );
  }
}
