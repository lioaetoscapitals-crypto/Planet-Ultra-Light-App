import { createApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const app = createApp();

app.listen(port, () => {
  // Keeping startup logs concise for local/mobile + backoffice integration.
  // eslint-disable-next-line no-console
  console.log(`Planet Ultra API listening on http://localhost:${port}`);
});
