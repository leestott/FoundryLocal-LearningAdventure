# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

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
- Use `.env.example` to document required variables (without real values)
- Keep API keys and tokens in environment variables, not in code

### Running Locally

- The game connects to `localhost:5272` by default (Foundry Local)
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

- **Zero production dependencies** - runs on Node.js built-ins only
- Development dependencies are limited to testing tools

## Contact

For security concerns, please contact the repository maintainers directly.
