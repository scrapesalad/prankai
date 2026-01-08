import { templates } from "../lib/templates";

export default function sitemap() {
  const baseUrl = "https://prankai.fun";
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/blog/ai-prank-calls`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/blog/prank-call-scripts`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/blog/safe-prank-calling-tips`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/blog/prank-calling-tips-2025`,
      lastModified: new Date()
    }
  ];

  const templateRoutes = templates.map((template) => ({
    url: `${baseUrl}/template/${template.id}`,
    lastModified: new Date()
  }));

  return [...routes, ...templateRoutes];
}
