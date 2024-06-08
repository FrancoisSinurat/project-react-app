import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET(request: { nextUrl: { searchParams: { get: (arg0: string) => any; }; }; }) {
  try {
    const id_user = request.nextUrl.searchParams.get('id_user');
    if (!id_user) {
      return NextResponse.json({ message: 'id_user is required' }, { status: 400 });
    }

    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM saved_answer WHERE id_user = ?", [id_user], (err: any, results: []) => {
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

export async function POST(request: { json: () => PromiseLike<{ id_user: any; id_assessment: any; id_answer: any;  }>}) {
  try {
    const { id_user, id_assessment, id_answer } = await request.json();
    console.log(id_user, id_assessment, id_answer);

    const result = await db.query("INSERT INTO saved_answer SET ?", {
      id_user, 
      id_assessment, 
      id_answer, 
    });

    return NextResponse.json({ id_user, id_assessment, id_answer, id: result.insertId });
  } catch (error) {
    return NextResponse.json(
      { message: error },
      {
        status: 500
      }
    )
  }
}