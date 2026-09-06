import { notFound } from "next/navigation";
import { getDatabase } from "@/db/client";
import { getBookWorkspaceData } from "@/lib/queries/book-workspace";
import { WorkspaceHeader } from "@/components/book-workspace/workspace-header";
import { ReadingStages } from "@/components/book-workspace/reading-stages";
import { ThoughtTimeline } from "@/components/book-workspace/thought-timeline";
import { Highlights } from "@/components/book-workspace/highlights";
import { ReflectionEditor } from "@/components/book-workspace/reflection-editor";
import { ResourceLinks } from "@/components/book-workspace/resource-links";

export default async function BookWorkspacePage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const data = await getBookWorkspaceData(getDatabase().db, bookId);
  if (!data.book) notFound();
  return <div className="page-frame"><WorkspaceHeader book={data.book} bookId={bookId} profile={data.profile} /><ReadingStages bookId={bookId} reflections={data.reflections} /><div className="workspace-columns"><div className="space-y-5"><ThoughtTimeline thoughts={data.thoughts} /><Highlights highlights={data.highlights} /></div><div className="space-y-5"><ReflectionEditor bookId={bookId} /><ResourceLinks bookId={bookId} resources={data.resources} /></div></div></div>;
}
