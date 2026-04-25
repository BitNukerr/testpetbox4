type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; alt: string; src: string };

function isSafeImageSource(src: string) {
  return src.startsWith("/") || src.startsWith("https://") || src.startsWith("http://") || src.startsWith("data:image/");
}

export function parseBlogContent(body: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  const paragraph: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join("\n").trim() });
    paragraph.length = 0;
  }

  body.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (image && isSafeImageSource(image[2].trim())) {
      flushParagraph();
      blocks.push({ type: "image", alt: image[1].trim(), src: image[2].trim() });
      return;
    }

    paragraph.push(line);
  });

  flushParagraph();
  return blocks;
}

export default function BlogContent({ body, preview = false }: { body: string; preview?: boolean }) {
  const blocks = parseBlogContent(body);

  return (
    <div className={preview ? "blog-content blog-content-preview" : "blog-content"}>
      {blocks.map((block, index) => {
        if (block.type === "image") {
          return (
            <figure className="blog-image-block" key={`${block.src}-${index}`}>
              <img src={block.src} alt={block.alt} />
              {block.alt ? <figcaption>{block.alt}</figcaption> : null}
            </figure>
          );
        }

        const lines = block.text.split("\n");
        return (
          <p key={`${block.text}-${index}`}>
            {lines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {line}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
