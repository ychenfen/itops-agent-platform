# ITOps Agent Platform

IT operations automation platform with server management, alerts, workflows,
agents, knowledge management, containers, virtualization, and data-center
operations.

## Requirements

- Node.js 18 or newer
- npm
- SQLite (embedded through `better-sqlite3`)

## Development

Install dependencies:

```bash
npm run install:all
```

Start the frontend and backend together:

```bash
npm run dev
```

Default development endpoints:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Environment variables are documented in `.env.example`. Do not commit real
credentials, API keys, SSH keys, or production connection strings.

## Build

```bash
npm run build
```

The backend output is written to `backend/dist`; the frontend output is
written to `frontend/dist`.

## Docker

```bash
npm run docker:build
npm run docker:up
```

Use `npm run docker:logs` to inspect service logs and `npm run docker:down` to
stop the deployment.

## License And Notices

This distribution is based on ITOps Agent Platform by Tan Ce:
<https://github.com/qinshihu/itops-agent-platform>.

Covered source files and modifications are licensed under the Mozilla Public
License 2.0. See [LICENSE](LICENSE) for the license terms and [NOTICE.txt](NOTICE.txt)
for upstream and third-party notices. When distributing executable builds,
provide recipients with a reasonable way to obtain the corresponding MPL
source code.
