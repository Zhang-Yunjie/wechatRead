import Image from "next/image";
import clsx from "clsx";

type BookCoverProps = {
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  featured?: boolean;
  className?: string;
};

function coverAccent(title: string) {
  const palettes = ["#254d43", "#8f4c3f", "#344258", "#8c7549", "#604f68"];
  return palettes[Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length];
}

export function BookCover({ title, author, coverUrl, featured = false, className }: BookCoverProps) {
  return (
    <div
      className={clsx("book-cover relative isolate overflow-hidden", featured && "book-cover--featured", className)}
      data-featured={String(featured)}
      data-testid="book-cover"
      style={{ "--cover-accent": coverAccent(title) } as React.CSSProperties}
    >
      {coverUrl ? (
        <Image src={coverUrl} alt={`${title}封面`} fill sizes={featured ? "260px" : "160px"} className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full flex-col justify-between p-[13%] text-white">
          <span className="text-[9px] tracking-[0.22em] opacity-60">READING EDITION</span>
          <div>
            <p className="font-serif text-[clamp(1rem,2vw,1.7rem)] leading-[1.12]">{title}</p>
            {author ? <p className="mt-3 text-[10px] tracking-widest opacity-72">{author}</p> : null}
          </div>
          <span className="h-px w-8 bg-white/60" />
        </div>
      )}
    </div>
  );
}
