import { NextResponse } from "next/server";
import db from "../../config/db";

export async function GET() {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM jobs", (err: any, results: []) => {
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
        position: any;
        sector: any;
        company: any;
        description: any;
        minimum_job_experience: any;
        talent_quota: any;
        job_type: any;
      }>
    | {
        position: any;
        sector: any;
        company: any;
        description: any;
        minimum_job_experience: any;
        talent_quota: any;
        job_type: any;
        location: any;
      };
}) {
  try {
    const {
      position,
      sector,
      company,
      description,
      minimum_job_experience,
      talent_quota,
      job_type,
      location,
    } = await request.json();

    console.log(
      position,
      sector,
      company,
      description,
      minimum_job_experience,
      talent_quota,
      job_type,
      location
    );

    const result = await db.query("INSERT INTO jobs SET ?", {
      position,
      sector,
      company,
      description,
      minimum_job_experience,
      talent_quota,
      job_type,
      location,
    });

    return NextResponse.json({
      position,
      sector,
      company,
      description,
      minimum_job_experience,
      talent_quota,
      job_type,
      location,
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
