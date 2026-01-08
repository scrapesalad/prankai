export default function robots() {
  const baseUrl = "https://prankai.fun";
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
