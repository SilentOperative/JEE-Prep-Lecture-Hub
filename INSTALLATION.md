# Installation

1. Extract the ZIP.
2. Install Node.js 20 or later.
3. Open a terminal in this folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the localhost URL shown in the terminal.

To build for hosting, run `npm run build`. Upload the generated `dist/` folder
to your static hosting provider or deploy the project through your usual Vite
workflow.

## Important

The supplied channel URL is a channel home URL. To populate actual lectures,
the importer needs individual public post links. Example shape:
`https://t.me/channel_username/123`

The starter intentionally does not scrape or download channel media. It uses
Telegram's official post embed and optional direct HTTPS URLs for media you are
authorised to stream.