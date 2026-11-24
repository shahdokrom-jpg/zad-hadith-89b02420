# Zad-hadith

Build a clean, serene, and modern Arabic Progressive Web App (PWA) with full RTL (Right-to-Left) layout for displaying a daily Prophetic Hadith from the attached PDF file (y200.pdf).

Requirements:

1. Data Extraction: Extract ALL 200 Hadiths from the attached PDF accurately, preserving full Arabic diacritics (Tashkeel), the narrator (الراوي), the source (رواه البخاري/مسلم), and any brief vocabulary explanation included at the end of the Hadith in the text. Store them cleanly in a local JSON/TypeScript data file inside the project.

2. Daily Hadith Display: Automatically show one distinct Hadith per day based on the current date. Display it inside an elegant, readable card using a classic Arabic font (like Amiri or Noto Naskh Arabic).

3. Interactive Features:

   - Previous/Next buttons to browse other Hadiths, plus a "Random Hadith" button.

   - A "Favorites" (المفضلة) tab/filter to save preferred Hadiths locally (using localStorage).

   - A "Copy" button and a "Share as Image/Text" button so users can easily share the Hadith card.

   - A simple search bar to search across the 200 Hadiths.

4. PWA & Daily Reminder:

   - Configure full PWA support (manifest.json and service worker) so the app can be installed via "Add to Home Screen" on iOS and Android.

   - Add a clean "Daily Reminder" (التذكير اليومي) setting in the header where the user can pick a preferred time and enable browser/local notifications displaying the text of the daily Hadith.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dabc70a8-fb61-488d-9a03-80e40ad6178b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
