import { hopeTheme } from "vuepress-theme-hope";

// The vuepress-theme-hope website's address is https://theme-hope.vuejs.press/zh/
export default hopeTheme({
  hostname: "https://yuanzhixiang.com",
  author: {
    name: "袁智翔",
    url: "/",
  },
  // reference https://theme-hope.vuejs.press/zh/guide/layout/navbar.html#%E5%AF%BC%E8%88%AA%E6%A0%8F%E9%93%BE%E6%8E%A5
  // navbar: ["/index.md", "/guide-started.md"],
  navbar: [
    {
      text: "主页",
      link: "/",
    },
    {
      text: "归档",
      link: "/guide-started.md"
    }
  ],
  darkmode: "disable",
  favicon: "/favicon.ico",
  repo: "yuanzhixiang/yuanzhixiang.github.io",
  toc: true,
  blog: {
    medias: {
      Github: "https://github.com/yuanzhixiang",
      // Juejin: "https://juejin.cn/user/764915823154270/posts",
      Email: "mailto:i@yuanzhixiang.com",
    },
  },
  plugins: {
    blog: true,
    // Configuration page is https://giscus.app/zh-CN
    comment: {
      provider: "Giscus",

      repo: "yuanzhixiang/yuanzhixiang.github.io",
      repoId: "R_kgDOIzba3Q",
      category: "Comments",
      categoryId: "DIC_kwDOIzba3c4CTsnO",
    },
  },
});
