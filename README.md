# DevKit

[![DevKit Tests](https://github.com/mayzix/devkit/actions/workflows/tests.yml/badge.svg)](https://github.com/mayzix/devkit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A lightweight, browser-based toolbox for everyday developer tasks.**

DevKit provides simple utilities for common development operations without requiring users to install additional software.

🌐 **Live demo:** https://mayzix.github.io/devkit/

## Features

- **JSON Formatter** — Format and validate JSON data.
- **Base64** — Encode and decode Base64 strings.
- **UUID Generator** — Generate unique identifiers.
- **JWT Decoder** — Inspect JWT headers and payloads. Decoding does not verify signatures.
- **URL Converter** — Encode and decode URL components.
- **SHA-256** — Generate SHA-256 hashes.

## Getting Started

No installation is required to use the online version.

Visit the [DevKit website](https://mayzix.github.io/devkit/).

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/mayzix/devkit.git
   ```

2. Open the project folder.
3. Open `index.html` in your browser.

## Technology

- HTML
- CSS
- JavaScript
- Node.js built-in test runner
- GitHub Actions
- GitHub Pages

## Running Tests

Install Node.js 22 or later, then run:

```bash
npm test
```

Automated tests also run through GitHub Actions when changes are pushed or pull requests are opened against `main`.

## Security and Privacy

DevKit is designed to perform its utilities locally in the browser.

- Do not enter passwords, private keys, or sensitive tokens into tools unless you understand the risks.
- JWT decoding only displays token contents. It does not validate authenticity or signatures.
- SHA-256 is a hashing function, not encryption.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Open an issue to discuss significant changes.
3. Create a branch for your contribution.
4. Make your changes and add tests where appropriate.
5. Submit a pull request.

Please follow the project's contribution guidelines.

## License

DevKit is released under the [MIT License](LICENSE).

---

Made with care for developers.
MIT. See [LICENSE](LICENSE).
