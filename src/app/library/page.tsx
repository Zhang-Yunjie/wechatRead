import { getDatabase } from "@/db/client";
import { getLibraryData } from "@/lib/queries/library";
import { LibraryGrid } from "@/components/library/library-grid";
import { EmptyState } from "@/components/empty-state";

export default async function LibraryPage() {
  const books = await getLibraryData(getDatabase().db);
  return (
    <div className="page-frame"><header className="page-header"><div><p className="eyebrow">YOUR SHELF</p><h1>我的书库</h1><p className="page-intro">书架回答“有什么”，队列回答“为什么现在读”。</p></div></header>
      <div className="pt-8">{books.length ? <LibraryGrid books={books} /> : <EmptyState title="书库还是空的" description="回到今日阅读，点击“同步微信读书”带回你的书架。" />}</div>
    </div>
  );
}
