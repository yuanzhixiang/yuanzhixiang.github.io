import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({
  lang: "zh-CN",
  title: "袁智翔的博客",
  description: "This is yuanzhixiang's blog",
  theme,
  shouldPrefetch: false,

  plugins: [
  ],
});
