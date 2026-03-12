# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Send a private report to the repository maintainers
3. Provide details about the vulnerability and steps to reproduce
4. Allow time for the maintainers to investigate and patch

We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical issues.

## Security Best Practices for Users

### Environment Variables

This game is designed to run locally without requiring any API keys or secrets. However, if you extend it:

- **Never** commit `.env` files or any file containing secrets
- Keep API keys and tokens in environment variables or `config.json` (git-ignored), not in code

### Running Locally

- The CLI game uses the `foundry-local-sdk` to connect to Foundry Local (no fixed port)
- The web version scans known ports to discover the running service
- No external network connections are made in demo mode
- All data is stored locally in JSON files

### Data Storage

- `progress.json` stores your game progress locally
- No personal data is collected or transmitted
- Feel free to delete `progress.json` to reset your data

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded API keys, tokens, or secrets
- [ ] No sensitive data in comments or logs
- [ ] No credentials in example files
- [ ] Dependencies are from trusted sources
- [ ] No eval() or similar dangerous functions with user input

## Dependencies

This project uses minimal dependencies to reduce attack surface:

- Production dependencies are limited to `foundry-local-sdk` for local model interaction
- Development dependencies are limited to testing tools

## Contact

For security concerns, please contact the repository maintainers directly.
