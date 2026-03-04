import { marked } from 'marked';
import juice from 'juice';

// Define a basic CSS template for emails
const emailCSS = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f7;
    color: #333333;
    padding: 20px;
  }
  h1, h2, h3 {
    color: #111111;
  }
  a {
    color: #1a73e8;
    text-decoration: none;
  }
  .button {
    display: inline-block;
    background-color: #1a73e8;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    margin-top: 20px;
  }
  .content {
    background: white;
    padding: 20px;
    border-radius: 10px;
  }
`;

// Function to convert Markdown to styled HTML
export default function markdownToHtml(markdown) {
    const htmlContent = marked(markdown);
    const htmlWithWrapper = `
    <body>
      <div class="content">
        ${htmlContent}
      </div>
    </body>
  `;
    return juice.inlineContent(htmlWithWrapper, emailCSS);
}

