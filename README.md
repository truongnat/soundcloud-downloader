# SoundCloud Downloader

This is a web application built with Next.js that allows users to download songs and playlists from SoundCloud.

## Features

*   **Download Single Tracks:** Enter a SoundCloud track URL to download the song in MP3 format.
*   **Download Playlists:** Enter a SoundCloud playlist URL to download all the songs in the playlist.
*   **Search for Songs:** Search for songs on SoundCloud and download them directly from the search results.
*   **Responsive Design:** The application is designed to work on both desktop and mobile devices.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/soundcloud-downloader.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd soundcloud-downloader
    ```
3.  Install the dependencies using Bun:
    ```bash
    bun install
    ```
4.  Run the development server:
    ```bash
    bun dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  Open the application in your browser.
2.  Select one of the tabs: "Single Track", "Playlist", or "Search".
3.  **Single Track:** Enter the URL of the SoundCloud track you want to download and click the "Download" button.
4.  **Playlist:** Enter the URL of the SoundCloud playlist you want to download and click the "Download" button.
5.  **Search:** Enter a search query to find songs on SoundCloud. The search results will be displayed, and you can download any song by clicking the "Download" button next to it.

## API Endpoints

The application uses the following API endpoints:

*   `/api/soundcloud/get-client-id`: Retrieves the SoundCloud client ID required for making API requests.
*   `/api/soundcloud/search?q={query}`: Searches for songs on SoundCloud based on the provided query.
*   `/api/soundcloud/song?url={song-url}`: Retrieves information about a single SoundCloud track.
*   `/api/soundcloud/playlist?url={playlist-url}`: Retrieves information about a SoundCloud playlist.
*   `/api/soundcloud/download?url={download-url}`: Downloads the song from the provided download URL.

## Technologies Used

*   [Next.js](https://nextjs.org/) - React framework for building server-side rendered and static web applications.
*   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
*   [Bun](https://bun.sh/) - Fast JavaScript all-in-one toolkit.
*   [SoundCloud API](https://developers.soundcloud.com/) - Used for fetching song and playlist information.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.