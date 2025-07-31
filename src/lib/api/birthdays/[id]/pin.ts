import dbconnect from "@/lib/dbconnect";
import Birthday from "@/models/Birthday";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).end();

  const { id } = req.query;
  const { pinned } = req.body;

  if (typeof pinned !== "boolean") return res.status(400).json({ error: "Invalid pinned value" });

  try {
    await dbconnect();
    const updated = await Birthday.findByIdAndUpdate(id, { pinned }, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
