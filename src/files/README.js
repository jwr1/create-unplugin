import bundlers from '../bundlers.js';

export default function genReadme(response) {
  let out = `# ${response.package}

## Install

\`\`\`sh
npm i ${response.package}
\`\`\`
`;

  for (const bundler of response.bundlers) {
    out += `
<details>
<summary>${bundlers[bundler].name}</summary><br>

\`\`\`js
${bundlers[bundler].install(response.package, response.export)}
\`\`\`

<br></details>
`;
  }

  return out;
}
