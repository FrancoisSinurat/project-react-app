import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM courses", (err: any, results: []) => {
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
    return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}

export async function POST(request: { json: () => PromiseLike<{ name: any; description: any; technology: any; hours_to_study: any; rating: any; level: any; learning_path: any; total_modules: any; registered_students: any; }> | { name: any; description: any; technology: any; hours_to_study: any; rating: any; level: any; learning_path: any; total_modules: any; registered_students: any; }; }) {
  try {
    const { name, description, technology, hours_to_study, rating, level, learning_path, total_modules, registered_students } = await request.json();
    console.log(name, description, technology, hours_to_study, rating, level, learning_path, total_modules, registered_students);

    const result = await db.query("INSERT INTO courses SET ?", {
      name, 
      description, 
      technology, 
      hours_to_study, 
      rating, 
      level, 
      learning_path, 
      total_modules, 
      registered_students
    });

    return NextResponse.json({ name, description, technology, hours_to_study, rating, level, learning_path, total_modules, registered_students, id: result.insertId });
  } catch (error) {
    return NextResponse.json(
      { message: error },
      {
        status: 500
      }
    )
  }
}