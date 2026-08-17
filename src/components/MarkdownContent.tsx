import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders `summary`/`opinion`-style Markdown fields (bold, italic, bullet
 * lists, paragraphs) with the app's hand-drawn typography. react-markdown
 * renders to React elements rather than raw HTML, so this is safe against
 * injected markup even though the source is user-authored.
 */
export function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="font-hand text-[17px] leading-[1.75] text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-accent underline" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
