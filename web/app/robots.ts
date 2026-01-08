export default function robots() {
  const baseUrl = "https://prankai.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
