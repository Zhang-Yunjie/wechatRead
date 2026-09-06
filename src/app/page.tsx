export default function HomePage() {
  return (
    <main className="min-h-screen px-8 py-7 lg:px-14">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[var(--rule)] pb-5">
        <div>
          <p className="text-xs tracking-[0.22em] text-[var(--moss)]">LOCAL READING COMPANION</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">阅读此刻</h1>
        </div>
        <button className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm text-white shadow-sm">
          同步微信读书
        </button>
      </header>
      <section className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center text-center">
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight">把读过的，慢慢变成自己的。</p>
          <p className="mt-5 leading-7 text-[var(--ink-soft)]">同步书架后，在这里选择主线阅读，也可以随时记下一句刚刚冒出的想法。</p>
        </div>
      </section>
    </main>
  );
}
