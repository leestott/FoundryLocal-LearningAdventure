# Contributing to Foundry Local Learning Adventure

Thank you for your interest in contributing! This guide will help you get started.

## 📋 How to Contribute

### Reporting Bugs

1. Check existing issues first to avoid duplicates
2. Use the bug report template if available
3. Include:
   - Node.js version (`node --version`)
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages (if any)

### Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its benefits
3. Explain how it helps beginners learn

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with clear messages
6. Push and open a Pull Request

## 🧪 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/FoundryLocal-LearningAdventure.git
cd FoundryLocal-LearningAdventure/game

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## 📁 Project Structure

```
FoundryLocal-LearningAdventure/
├── README.md       # Main documentation
├── LICENSE         # MIT License
├── CONTRIBUTING.md # This file
├── SECURITY.md     # Security policy
├── .github/        # CI/CD workflows
└── game/           # Game source code
    ├── src/        # Source code (game.js, levels.js, mentor.js)
    ├── web/        # Web version files
    ├── data/       # JSON data files
    └── tests/      # Test suite
```

## ✅ Code Guidelines

- Use ES6+ features (async/await, modules)
- Add comments for complex logic
- Keep functions small and focused
- Handle errors gracefully with try/catch
- No hardcoded secrets or API keys

## 🎯 Ideas for Contributions

- **New levels** teaching additional AI concepts
- **Accessibility** improvements
- **Localization** to other languages
- **Better error messages** for beginners
- **More hints** and explanations
- **UI/UX improvements**

## 📝 Commit Message Format

```
type: short description

- Detail 1
- Detail 2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`

## 🔍 Review Process

1. All PRs require review before merging
2. Tests must pass
3. No security issues
4. Documentation updated if needed

Thank you for helping make this project better! 🎮
