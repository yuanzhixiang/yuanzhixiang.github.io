import { defineUserConfig } from "vuepress";
import theme from "./theme";
import plantuml from "markdown-it-textual-uml";

export default defineUserConfig({
  lang: "zh-CN",
  title: "袁智翔的博客",
  description: "This is yuanzhixiang's blog",
  theme,
  shouldPrefetch: false,
  head: [
    [
      'script', {}, `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?272e4030c6e0dc58f41b2000659a08ff";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(hm, s);
        })();
        `
    ]
  ],

  extendsMarkdown: (md) => {
    md.use(plantuml);
  },

  plugins: [
    // todo wait https://support.algolia.com/hc/en-us/requests/538272 finish, then config search
    //   config search application in https://www.algolia.com/apps/2DWPBX4F7Q/onboarding
  ],
});
