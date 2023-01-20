import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({
  lang: "zh-CN",
  title: "袁智翔的博客",
  description: "This is yuanzhixiang's blog",
  theme,
  shouldPrefetch: false,

  plugins: [
    // todo wait https://support.algolia.com/hc/en-us/requests/538272 finish, then config search
    //   config search application in https://www.algolia.com/apps/2DWPBX4F7Q/onboarding
  ],
});
