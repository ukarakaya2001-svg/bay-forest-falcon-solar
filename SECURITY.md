# Security Policy

## Supported versions

Only the latest release on the default branch is treated as supported.

## Reporting a vulnerability

Please do not disclose an unpatched vulnerability in a public issue. Report it
privately to the project maintainers with:

- affected version/commit;
- reproducible steps or a minimal proof of concept;
- security impact;
- suggested remediation, if known.

Do not include credentials, session tokens, private user data, or production
secrets in a report.

## Security baseline

The project treats these as release-blocking controls:

- no known XSS/HTML injection in source highlighting or generated HTML;
- same-origin validation for browser message channels;
- allowlisted OAuth providers and same-origin callback paths;
- no secrets stored in source;
- bounded parser/interpreter/resource usage;
- schema validation, capability tokens, rate limits and size limits on signaling traffic;
- parameterized database queries;
- dependency lockfile and CI audit checks;
- typecheck, lint, unit tests and production build before release.

Automated checks are defense in depth; they do not replace independent
penetration testing or review of deployment infrastructure.
