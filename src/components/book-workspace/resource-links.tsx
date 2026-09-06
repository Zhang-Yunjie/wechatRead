"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";

type Resource = { id: string; title: string; url: string; relationship: string; type: string };
export function ResourceLinks({ bookId, resources }: { bookId: string; resources: Resource[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  async function save() {
    const response = await fetch(`/api/books/${bookId}/resources`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, url, type: "article", relationship: "延伸阅读" }) });
    if (response.ok) window.location.reload();
  }
  return <section className="workspace-panel"><div className="section-heading"><div><p className="eyebrow">延伸资料</p><h2>从这本书继续走出去</h2></div><button className="icon-button" aria-label="添加资料" onClick={() => setOpen(!open)}><Plus size={14} /></button></div>{resources.length ? <div className="resource-list">{resources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer"><span>{resource.type}</span><div><h3>{resource.title}</h3><p>{resource.relationship}</p></div><ExternalLink size={14} /></a>)}</div> : <p className="panel-empty">把文章、论文或视频作为一条线索留在这里。</p>}{open ? <div className="resource-form"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="资料标题" /><input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" /><button className="primary-button" onClick={() => void save()}>保存链接</button></div> : null}</section>;
}
