# Pawn Island Academy

Pawn Island Academy offers personalized chess coaching in Rhode Island.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [SEO Guidelines](#seo-guidelines)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Chess Coaching:** Personalized private, group, and camp instruction for all skill levels
- **Pawn Island Scheduler:** Branded booking flow with a secure Google Calendar backend scaffold
- **About Me:** Information about the coach and teaching philosophy
- **Testimonials:** Student and parent feedback loaded into the coaching page
- **SEO Landing Pages:** Dedicated local, online, scholastic, and adult coaching pages
- **LLM Discovery:** `llms.txt`, `llms-full.txt`, and public `site-facts.json` summarize the business for AI systems
- **IndexNow:** GitHub Actions submits sitemap URLs to Bing/IndexNow after content pushes
- **Modern Static Shell:** Shared ES modules hydrate navigation, footer, analytics, reveal effects, FAQ behavior, and utility UI without legacy framework dependencies
- **Validation Pipeline:** Local and GitHub Actions validation check core SEO, structured data, sitemap coverage, local references, and JSON assets

## Project Structure
```
pawnisland/
├── .github/
│   └── workflows/
│       └── validate-site.yml
├── css/
│   ├── foundation.css
│   ├── footer.css
│   ├── home.css
│   ├── navbar-chess.css
│   ├── seo-pages.css
│   ├── scheduler.css
│   └── styles.css
├── data/
│   ├── scheduler-config.json
│   └── testimonials.json
├── js/
│   ├── coaching.js
│   ├── scheduler.js
│   ├── site-core.js
│   └── site-shell.js
├── pages/
│   ├── landing/
│   │   ├── about-me.html
│   │   ├── adult-chess-lessons.html
│   │   ├── coaching.html
│   │   ├── online-chess-coaching.html
│   │   ├── providence-chess-lessons.html
│   │   ├── rhode-island-chess-lessons.html
│   │   ├── schedule.html
│   │   └── scholastic-chess-coaching.html
│   └── partials/
│       ├── footer.html
│       └── navbar.html
├── images/
│   ├── brand-icons/
│   ├── coaching/
│   ├── headers-pages/
│   └── testimonials/
├── index.html
├── llms.txt
├── llms-full.txt
├── LICENSE
├── package.json
├── README.md
├── robots.txt
├── scripts/
│   └── validate-site.mjs
├── site-facts.json
├── site.webmanifest
├── sitemap.xml
└── workers/
    └── scheduler/
```

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone https://github.com/raisethecurve/pawnisland.git
   ```

2. **Navigate to the Project Directory**
   ```bash
   cd pawnisland
   ```

3. **Install Dependencies**
   - Ensure you have [Node.js](https://nodejs.org/) installed
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run the Application**
   - Serve the folder locally so shared partials load through `fetch`:
     ```bash
     python -m http.server 4177
     ```
   - Visit `http://localhost:4177/`

5. **Validate the Site**
   ```bash
   npm test
   ```

## Usage
- **Chess Coaching:** Visit the [Chess Coaching](https://www.pawnislandacademy.com/pages/landing/coaching.html) page
- **Scheduling:** Book lessons through the Pawn Island Scheduler at [Schedule a Lesson](https://www.pawnislandacademy.com/pages/landing/schedule.html)
- **Local Lessons:** Use [Rhode Island Chess Lessons](https://www.pawnislandacademy.com/pages/landing/rhode-island-chess-lessons.html) and [Providence Chess Lessons](https://www.pawnislandacademy.com/pages/landing/providence-chess-lessons.html) for local-intent traffic
- **Online Coaching:** Use [Online Chess Coaching](https://www.pawnislandacademy.com/pages/landing/online-chess-coaching.html) for remote students

## Scheduler Backend
The public site is static, so live calendar reads and writes run through the Cloudflare Worker in `workers/scheduler/`.

See `workers/scheduler/README.md` for Google Calendar service-account setup, D1 setup, and deployment commands.

## SEO Guidelines
When creating or updating pages, follow these guidelines for optimal search engine visibility:

- **Page Titles:** Include location keywords (Rhode Island, Providence) and primary service
- **Meta Descriptions:** 150-160 characters with core services and location
- **Keywords:** Include chess-related terms and local Rhode Island keywords
- **Image Alt Text:** Descriptive alt text with relevant keywords
- **Performance:** Prefer optimized WebP assets for page imagery
- **URL Structure:** Keep URLs short and descriptive
- **Headings:** Use H1-H6 tags appropriately with keywords
- **Content:** Create high-quality, unique content that includes relevant keywords naturally
- **Canonical Host:** Use `https://www.pawnislandacademy.com/` in canonicals, schema, sitemaps, Open Graph tags, and AI summary files
- **Structured Data:** Keep `LocalBusiness`, `Person`, `Service`, `FAQPage`, `BreadcrumbList`, and `ReserveAction` content aligned with visible page copy
- **LLM Readiness:** Update `llms.txt`, `llms-full.txt`, and `site-facts.json` when services, contact details, or target audiences change
- **Measurement:** Schedule and email CTAs emit GA4 events through `gtag` when analytics is available
- **Preflight:** Run `npm test` before publishing content or structural changes

## Off-Site SEO Checklist
- Create or update Google Business Profile, Bing Places, and Apple Business Connect with the same name, website, email, service area, and booking URL
- Add real coaching photos and keep service descriptions aligned with the website
- Ask satisfied students and parents for platform-compliant reviews after successful lessons
- Build local citations from Rhode Island chess, school, club, tournament, and community organizations

## Contributing
1. Fork the Repository
2. Create a Feature Branch
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit Your Changes
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the Branch
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request

## License
This project is licensed under the [MIT License](LICENSE).

---
© 2026 Pawn Island Academy. All rights reserved.
