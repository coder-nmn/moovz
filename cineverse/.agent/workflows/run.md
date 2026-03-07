---
description: how to run CineVerse
---

To run the CineVerse project, follow these steps:

1. **Configure Environment Variables**:
   - Open [server/.env](file:///d:/cohort_2/Mine_projects/cineverse/server/.env) and set your `MONGO_URI`.
   - Open [client/.env](file:///d:/cohort_2/Mine_projects/cineverse/client/.env) and set your `VITE_TMDB_API_KEY`.

2. **Start Backend Server**:
   - Open a terminal in the `server` directory.
   - Run `npm install` (if not already done).
   - Run `npm run dev`.

3. **Start Frontend Client**:
   - Open a secondary terminal in the `client` directory.
   - Run `npm install` (if not already done).
   - Run `npm run dev`.

4. **Access the App**:
   - Open your browser to the URL provided by the Vite terminal (usually `http://localhost:5173`).
