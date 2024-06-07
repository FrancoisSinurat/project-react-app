import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM learning_path", (err: any, results: []) => {
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
        learning_path_name: any;
      }>
    | {
        learning_path_name: any;
      };
}) {
  try {
    const { learning_path_name } = await request.json();

    console.log(learning_path_name);

    const result = await db.query("INSERT INTO learning-path SET ?", {
      learning_path_name,
    });

    return NextResponse.json({
      learning_path_name,
      id: result.insertlearning_path_Id,
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
