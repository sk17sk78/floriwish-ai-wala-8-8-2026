import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const adminSecretPath = process.env.ADMIN_SECRET_PATH || "admin";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        `/${adminSecretPath}`,
        "/cart",
        "/checkout",
        "/transaction",
        "/search",
        "/user",
        "/account",
        "/register",
        "/login",
        "/dashboard",
      ],
    },
    host: "https://floriwish.com",
    sitemap: "https://floriwish.com/sitemap.xml",
  };
}
