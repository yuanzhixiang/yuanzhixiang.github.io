import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme({
  hostname: "https://yuanzhixiang.com",
  author: {
    name: "袁智翔",
    url: "/",
  },
  darkmode: "disable",

  // todo It's not work
  favicon: "/favicon.ico",

  plugins: {
    comment: {
      provider: "Giscus",

      repo: "yuanzhixiang/yuanzhixiang.github.io",
      repoId: "R_kgDOIzba3Q",
      category: "Comments",
      categoryId: "DIC_kwDOIzba3c4CTsnO",
    },
  },
});
