### Technology Stack Overview
This site uses Notion as its content source. The frontend is built with the familiar React and Next.js stack, with content fetched and rendered on the server.
### Key Components
- Content layer: Notion Database for articles, tags, and publication status
- Integration layer: the official API with lightweight data transformation
- Presentation layer: Next.js routes and page components
- Deployment layer: Vercel or a similar platform
### Architecture Diagram
[[IMAGE_1]]
### Key Lessons
1. Define the data model and required fields clearly
2. Keep frontend transformations minimal and normalize formats on the backend
3. Use caching and incremental builds to reduce requests to Notion
---
Future articles will take a closer look at API encapsulation and caching strategies.
