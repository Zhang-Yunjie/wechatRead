import { Suspense } from "react";
import { getDatabase } from "@/db/client";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DailyReview } from "@/components/today/daily-review";
import { FeaturedBook } from "@/components/today/featured-book";
import { QuickCapture } from "@/components/today/quick-capture";
import { RecentThoughts } from "@/components/today/recent-thoughts";
import { SideReading } from "@/components/today/side-reading";
import { HomeHeader } from "@/components/today/home-header";
import { EmptyState } from "@/components/empty-state";

async function TodayContent() {
  const data = await getDashboardData(getDatabase().db);
  return (
    <>
      <div className="today-grid">
        <div>{data.mainBook ? <FeaturedBook book={data.mainBook} /> : <EmptyState title="先选一本主线书" description="同步微信读书后，从书库挑一本此刻真正想读的书。" />}</div>
        <div className="space-y-5">
          <QuickCapture bookTitle={data.mainBook?.title} />
          <DailyReview thoughts={data.dueReviews} />
          <RecentThoughts thoughts={data.recentThoughts} />
        </div>
      </div>
      <SideReading books={data.sideBooks} />
    </>
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
