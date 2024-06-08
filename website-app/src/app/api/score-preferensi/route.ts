import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET(request: { nextUrl: { searchParams: { get: (arg0: string) => any; }; }; }) {
  try {
    const id_user = request.nextUrl.searchParams.get('id_user');
    if (!id_user) {
      return NextResponse.json({ message: 'id_user is required' }, { status: 400 });
    }

    const results = await new Promise((resolve, reject) => {
      db.query("SELECT learning_path, id_user FROM score WHERE id_user = ?", [id_user], (err: any, results: []) => {
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

export async function POST(request: { json: () => PromiseLike<{ id_user: any; learning_path: any; preferensi_point: any;  }>}) {
  try {
    const { id_user, learning_path, preferensi_point } = await request.json();
    console.log(id_user, learning_path, preferensi_point);

    const result = await db.query("INSERT INTO score SET ?", {
      id_user, 
      learning_path, 
      preferensi_point, 
    });

    return NextResponse.json({ id_user, learning_path, preferensi_point, id: result.insertId });
  } catch (error) {
    return NextResponse.json(
      { message: error },
      {
        status: 500
      }
    )
  }
}