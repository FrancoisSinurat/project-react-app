import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM job_applicant", (err: any, results: []) => {
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
        vacancy_id: any;
        user_id: any;
      }>
    | {
        vacancy_id: any;
        user_id: any;
      };
}) {
  try {
    const { vacancy_id, user_id } = await request.json();

    console.log(vacancy_id, user_id);

    const result = await db.query("INSERT INTO learning-path SET ?", {
      vacancy_id,
      user_id,
    });

    return NextResponse.json({
      vacancy_id,
      user_id,
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
