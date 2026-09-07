import { Suspense } from "react";
import { getDatabase } from "@/db/client";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DailyReview } from "@/components/today/daily-review";
import { QuickCapture } from "@/components/today/quick-capture";
import { RecentThoughts } from "@/components/today/recent-thoughts";
import { HomeHeader } from "@/components/today/home-header";
import { TodayReading } from "@/components/today/today-reading";

async function TodayContent() {
  const data = await getDashboardData(getDatabase().db);
  return (
    <TodayReading mainBook={data.mainBook} sideBooks={data.sideBooks}>
      <div className="space-y-5">
        <QuickCapture bookTitle={data.mainBook?.title} />
        <DailyReview thoughts={data.dueReviews} />
        <RecentThoughts thoughts={data.recentThoughts} />
      </div>
    </TodayReading>
  );
}

export default function HomePage() {
  return (
    <div className="page-frame">
      <HomeHeader />
      <Suspense fallback={<div className="page-loading">正在翻开今天的一页…</div>}><TodayContent /></Suspense>
    </div>
  );
}
