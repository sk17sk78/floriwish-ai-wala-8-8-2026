import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/hsiwirolfkey8080/",
        "/cart",
        "/checkout",
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
