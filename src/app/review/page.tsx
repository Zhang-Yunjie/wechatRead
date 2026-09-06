import { desc, ne } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { createThoughtRepository } from "@/db/repositories/thoughts";
import { thoughts } from "@/db/schema";
import { ReviewPageView } from "./review-page-view";

export default async function ReviewPage() {
  const db = getDatabase().db;
  const [due, reviewed] = await Promise.all([createThoughtRepository(db).listDue(new Date(), 3), db.select().from(thoughts).where(ne(thoughts.reviewState, "pending")).orderBy(desc(thoughts.lastReviewedAt)).limit(40)]);
  return <div className="page-frame"><header className="page-header"><div><p className="eyebrow">DAILY ECHO</p><h1>回顾</h1><p className="page-intro">不是背诵昨天，而是看见自己现在是否仍然相信。</p></div></header><div className="pt-8"><ReviewPageView due={due} reviewed={reviewed} /></div></div>;
}
