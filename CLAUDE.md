# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Settings

- Respond to users in Japanese

## Related Documents

- @docs/project.md : Project overview, features, development status
- @docs/system-architecture.md : System architecture and design principles

## Development Notes

- Write code comments in Japanese, only for content that cannot be read from the code itself

## Git Workflow

- Create a new branch for each pull request
- Branch naming convention: `<type>/<description>` (e.g., `feat/add-login`, `fix/auth-error`, `docs/update-readme`)
- Never commit directly to the main branch
- Branches will be automatically deleted after PR merge (configured in GitHub)
- Follow the pull request template at `.github/pull_request_template.md` when creating PRs
