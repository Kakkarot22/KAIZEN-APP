# KAIZEN // Japanese JLPT N5–N3 Mastery OS

A client-side Japanese mastery web and mobile application designed for JLPT N5, N4, and N3 preparation.

## Directory Architecture

- **`app/`**: The complete production web & mobile application (React + Vite + Tailwind CSS). Self-contained and ready for Vercel, GitHub, and Capacitor (Android/iOS).
- **`data/`**: Processed and normalized JSON reference datasets (curriculum, enhanced questions, kanji breakdowns).
- **`OG_data/`**: Pristine original backup archive of all 35 raw scraped files (.csv, .js, .json).

## Running the Application Locally

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

## Building for Production

```bash
cd app
npm run build
```
Generates production assets in `app/dist/`.

