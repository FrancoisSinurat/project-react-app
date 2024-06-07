import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT id_answer, id_preferensi, point, learning_path, text FROM answers WHERE id_preferensi IS NOT NULL", (err: any, results: []) => {
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
