"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Library, ListOrdered, Settings } from "./icons";
import clsx from "clsx";

const nav = [
  { href: "/", label: "今日阅读", icon: BookOpen },
  { href: "/queue", label: "阅读队列", icon: ListOrdered },
  { href: "/library", label: "我的书库", icon: Library },
  { href: "/review", label: "回顾", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar__brand" aria-label="阅读此刻首页">
        <span className="sidebar__seal">阅</span>
        <span><strong>阅读此刻</strong><small>Reading Moment</small></span>
      </Link>
      <nav className="mt-12 space-y-1" aria-label="主导航">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={clsx("nav-link", pathname === href && "nav-link--active")}>
            <Icon size={17} strokeWidth={1.7} />{label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <Link href="/settings" className={clsx("nav-link", pathname === "/settings" && "nav-link--active")}>
          <Settings size={17} strokeWidth={1.7} />设置
        </Link>
        <p className="mt-5 px-3 text-[10px] leading-5 tracking-wider text-white/38">数据只存放在这台电脑</p>
      </div>
    </aside>
  );
}
