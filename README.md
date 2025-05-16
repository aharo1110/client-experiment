# client-experiment
Experimental web applets client for Capstone project using Electron, React, and [Unternet's](https://unternet.co/) [intelligent kernel](https://github.com/unternet-co/client/tree/main/kernel).

![Example usecase of the client](.assets/client-image.png)

## Setup

For now as this gets developed, do the following

1. Run `npm install`
2. In the kernel folder: Copy `.env.example` to `.env` and fill in the required environment variables
3. Run `npm run build` and `npm run dev`

> [!NOTE]
> Web Applets integration is still a work-in-progress. Some behavior may occur differently than expected when using actions. Only expect some sites to load given the way applet integration was achieved.