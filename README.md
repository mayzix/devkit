# DevKit

A small collection of browser-based utilities for everyday developer tasks.

**Live demo:** coming soon  
**Status:** early development

## Tools

- JSON formatter and validator
- Base64 decoder
- UUID v4 generator
- JWT header and payload decoder
- URL encoder / decoder
- SHA-256 hash generator

## Privacy

DevKit is a static website. Processing happens locally in your browser; this project does not send your input to a backend. Do not treat the JWT decoder as a security validator: it does not verify token signatures. Avoid pasting secrets into websites, including local tools you have not reviewed.

## Run locally

No build tools or dependencies are required.

1. Clone the repository.
2. Open `index.html` in a modern browser.
3. For Web Crypto and clipboard features, use localhost or HTTPS. One option is `python -m http.server 8000`, then visit `http://localhost:8000`.

## Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## Roadmap

- [ ] Add Base64 encoding with Unicode support
- [ ] Add unit tests
- [ ] Add accessibility and keyboard-navigation checks
- [ ] Add more developer utilities based on community feedback

## License

MIT. See [LICENSE](LICENSE).
