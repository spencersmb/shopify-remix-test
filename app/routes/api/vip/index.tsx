import type { LoaderFunction } from '@remix-run/node';
import db from "../../../db.server";


export const loader: LoaderFunction = async () => {
  const vipPrograms = await db.vipProgram.findMany();
  return vipPrograms;
};