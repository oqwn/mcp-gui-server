/**
 * Enhanced Markdown to HTML converter with proper code block support
 */
export class MarkdownConverter {
  static toHtml(markdown: string): string {
    if (!markdown) return "";

    // First handle code blocks (must be done before other processing)
    let html = this.processCodeBlocks(markdown);

    html = html
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Code inline (avoid conflict with code blocks)
      .replace(
        /(?<!<pre><code[^>]*>.*)`([^`]+)`(?!.*<\/code><\/pre>)/g,
        "<code>$1</code>"
      )
      // Links
      .replace(
        /\[([^\]]+)\]\(([^\)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
      )
      // Line breaks (avoid inside code blocks)
      .replace(/(?<!<pre><code[^>]*>.*)\n\n(?!.*<\/code><\/pre>)/g, "</p><p>")
      .replace(/(?<!<pre><code[^>]*>.*)\n(?!.*<\/code><\/pre>)/g, "<br>")
      // Lists (simple implementation)
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/^(\d+)\. (.*$)/gim, "<li>$1. $2</li>");

    // Wrap in paragraph tags if needed
    if (
      !html.includes("<h1>") &&
      !html.includes("<h2>") &&
      !html.includes("<h3>") &&
      !html.includes("<pre>")
    ) {
      html = "<p>" + html + "</p>";
    }

    // Clean up list formatting
    html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    html = html.replace(/<\/ul>\s*<ul>/g, "");

    return html;
  }

  /**
   * Process code blocks with syntax highlighting support
   */
  private static processCodeBlocks(markdown: string): string {
    // Handle fenced code blocks with language specification
    return markdown.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match, language, code) => {
        const lang = language || "text";
        const escapedCode = this.escapeHtml(code.trim());

        return `<pre data-language="${lang}"><code class="language-${lang}">${escapedCode}</code></pre>`;
      }
    );
  }

  /**
   * Escape HTML characters in code
   */
  private static escapeHtml(text: string): string {
    const div = { innerHTML: "" };
    const textNode = { textContent: text };

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
}
