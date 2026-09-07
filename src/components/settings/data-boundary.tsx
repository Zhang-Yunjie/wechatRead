import { Database, LockKeyhole, WifiOff } from "lucide-react";

export function DataBoundary() {
  return <section className="data-boundary"><p className="eyebrow">数据边界</p><h2>这是一间只在本机亮灯的书房</h2><div className="data-boundary__grid"><div><Database /><strong>本地保存</strong><p>书籍、队列、想法和复盘写入本机 SQLite。</p></div><div><LockKeyhole /><strong>密钥不入库</strong><p>密钥仅存本地私密文件或环境变量，不进入阅读数据库。</p></div><div><WifiOff /><strong>离线可读写</strong><p>没有网络时仍能查看旧数据并记录思考。</p></div></div></section>;
}
