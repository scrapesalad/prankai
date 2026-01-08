import { templates } from "../lib/templates";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
    }
  ];

  const templateRoutes = templates.map((template) => ({
    url: `${baseUrl}/template/${template.id}`,
    lastModified: new Date()
  }));

  return [...routes, ...templateRoutes];
}
