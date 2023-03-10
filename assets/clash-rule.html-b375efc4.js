import{_ as n,W as s,X as a,Y as t}from"./framework-cc0d0bf8.js";const p={},e=t(`<h1 id="clash-rule" tabindex="-1"><a class="header-anchor" href="#clash-rule" aria-hidden="true">#</a> clash rule</h1><h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言" aria-hidden="true">#</a> 前言</h2><p>Clash 是一款基于规则的跨平台代理软件，支持 Windows，macOS，Linux 操作系统。它可以帮助用户实现网络访问控制等需求。</p><p>Clash 使用规则文件来控制流量，规则文件的作用是告诉 Clash 哪些流量需要代理，哪些流量不需要代理。规则文件是文本文件，其中包含了一些规则，可以根据规则的匹配结果来选择是否使用代理。</p><p>在 Clash 规则文件中，最重要的是 Proxy 和 Rule 两个关键词。Proxy 定义了代理服务器的信息，Rule 定义了使用代理的规则。在 Rule 中，可以使用不同的匹配方式来匹配请求的目标地址或域名，从而选择是否使用代理。</p><h2 id="clash-规则的基础语法" tabindex="-1"><a class="header-anchor" href="#clash-规则的基础语法" aria-hidden="true">#</a> Clash 规则的基础语法</h2><p>Clash 规则采用 YAML 格式，采用了缩进表示层次关系，rule 分为三个部分，<code>&lt;匹配规则&gt;,&lt;匹配规则的参数&gt;,&lt;代理节点&gt;</code>。下面是一个简单的 Clash 规则示例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> DOMAIN<span class="token punctuation">-</span>SUFFIX<span class="token punctuation">,</span>google.com<span class="token punctuation">,</span>proxy
  <span class="token punctuation">-</span> DOMAIN<span class="token punctuation">,</span>google.com<span class="token punctuation">,</span>proxy
  <span class="token punctuation">-</span> DOMAIN<span class="token punctuation">-</span>KEYWORD<span class="token punctuation">,</span>google.com<span class="token punctuation">,</span>proxy
  <span class="token punctuation">-</span> GEOIP<span class="token punctuation">,</span>CN<span class="token punctuation">,</span>DIRECT
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clash-规则匹配实现原理" tabindex="-1"><a class="header-anchor" href="#clash-规则匹配实现原理" aria-hidden="true">#</a> Clash 规则匹配实现原理</h2><p>Clash 规则匹配的基本原理是将流量的各个部分（如域名、IP、端口等）与规则进行匹配，以确定是否应该代理该流量。例如上述示例中的 DOMAIN 和 GEOIP 就是对域名和 IP 进行匹配。</p><p>Clash 规则匹配的源代码在 clash/rule 文件夹下面，例如上面的 DOMAIN-KEYWORD, GEOIP 对应文件是 domain_keyword.go, geoip.go。下面通过源代码来学习规则匹配的原理，首先从 TCP 代理的入口开始看。</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token comment">// tunnel/tunnel.go</span>
<span class="token keyword">func</span> <span class="token function">handleTCPConn</span><span class="token punctuation">(</span>connCtx C<span class="token punctuation">.</span>ConnContext<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  metadata <span class="token operator">:=</span> connCtx<span class="token punctuation">.</span><span class="token function">Metadata</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token comment">// ...</span>

  <span class="token comment">// 该行代码最终返回的 proxy 就是匹配中的代理节点，rule 则是使用的代理规则</span>
	proxy<span class="token punctuation">,</span> rule<span class="token punctuation">,</span> err <span class="token operator">:=</span> <span class="token function">resolveMetadata</span><span class="token punctuation">(</span>connCtx<span class="token punctuation">,</span> metadata<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
  proxies <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span>C<span class="token punctuation">.</span>Proxy<span class="token punctuation">)</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">resolveMetadata</span><span class="token punctuation">(</span>ctx C<span class="token punctuation">.</span>PlainContext<span class="token punctuation">,</span> metadata <span class="token operator">*</span>C<span class="token punctuation">.</span>Metadata<span class="token punctuation">)</span> <span class="token punctuation">(</span>proxy C<span class="token punctuation">.</span>Proxy<span class="token punctuation">,</span> rule C<span class="token punctuation">.</span>Rule<span class="token punctuation">,</span> err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// 元信息中指定了代理则直接走指定的代理</span>
	<span class="token keyword">if</span> metadata<span class="token punctuation">.</span>SpecialProxy <span class="token operator">!=</span> <span class="token string">&quot;&quot;</span> <span class="token punctuation">{</span>
		<span class="token keyword">var</span> exist <span class="token builtin">bool</span>
		proxy<span class="token punctuation">,</span> exist <span class="token operator">=</span> proxies<span class="token punctuation">[</span>metadata<span class="token punctuation">.</span>SpecialProxy<span class="token punctuation">]</span>
		<span class="token keyword">if</span> <span class="token operator">!</span>exist <span class="token punctuation">{</span>
			err <span class="token operator">=</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;proxy %s not found&quot;</span><span class="token punctuation">,</span> metadata<span class="token punctuation">.</span>SpecialProxy<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>

  
	<span class="token keyword">switch</span> mode <span class="token punctuation">{</span>
  <span class="token comment">// 判断当前的模式，如果为 DIRECT 模式则选择 DIRECT 对应的节点</span>
	<span class="token keyword">case</span> Direct<span class="token punctuation">:</span>
		proxy <span class="token operator">=</span> proxies<span class="token punctuation">[</span><span class="token string">&quot;DIRECT&quot;</span><span class="token punctuation">]</span>
  <span class="token comment">// 判断当前的模式，如果为 GLOBAL 模式则选择 GLOBAL 对应的节点</span>
	<span class="token keyword">case</span> Global<span class="token punctuation">:</span>
		proxy <span class="token operator">=</span> proxies<span class="token punctuation">[</span><span class="token string">&quot;GLOBAL&quot;</span><span class="token punctuation">]</span>
	<span class="token comment">// 如果不是前两种模式则走规则匹配</span>
	<span class="token keyword">default</span><span class="token punctuation">:</span>
		proxy<span class="token punctuation">,</span> rule<span class="token punctuation">,</span> err <span class="token operator">=</span> <span class="token function">match</span><span class="token punctuation">(</span>metadata<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">match</span><span class="token punctuation">(</span>metadata <span class="token operator">*</span>C<span class="token punctuation">.</span>Metadata<span class="token punctuation">)</span> <span class="token punctuation">(</span>C<span class="token punctuation">.</span>Proxy<span class="token punctuation">,</span> C<span class="token punctuation">.</span>Rule<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	configMux<span class="token punctuation">.</span><span class="token function">RLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">defer</span> configMux<span class="token punctuation">.</span><span class="token function">RUnlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">var</span> resolved <span class="token builtin">bool</span>
	<span class="token keyword">var</span> processFound <span class="token builtin">bool</span>

  <span class="token comment">// 进行 DNS 解析</span>
	<span class="token keyword">if</span> node <span class="token operator">:=</span> resolver<span class="token punctuation">.</span>DefaultHosts<span class="token punctuation">.</span><span class="token function">Search</span><span class="token punctuation">(</span>metadata<span class="token punctuation">.</span>Host<span class="token punctuation">)</span><span class="token punctuation">;</span> node <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		ip <span class="token operator">:=</span> node<span class="token punctuation">.</span>Data<span class="token punctuation">.</span><span class="token punctuation">(</span>net<span class="token punctuation">.</span>IP<span class="token punctuation">)</span>
		metadata<span class="token punctuation">.</span>DstIP <span class="token operator">=</span> ip
		resolved <span class="token operator">=</span> <span class="token boolean">true</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> rule <span class="token operator">:=</span> <span class="token keyword">range</span> rules <span class="token punctuation">{</span>
		<span class="token comment">//...</span>

    <span class="token comment">// 下面的 Match 进行规则匹配</span>
		<span class="token keyword">if</span> rule<span class="token punctuation">.</span><span class="token function">Match</span><span class="token punctuation">(</span>metadata<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// 匹配上后通过 rule.Adapter() 找到对应的代理节点也就是 adapter 然后返回</span>
			adapter<span class="token punctuation">,</span> ok <span class="token operator">:=</span> proxies<span class="token punctuation">[</span>rule<span class="token punctuation">.</span><span class="token function">Adapter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span>
			<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
				<span class="token keyword">continue</span>
			<span class="token punctuation">}</span>

			<span class="token keyword">if</span> metadata<span class="token punctuation">.</span>NetWork <span class="token operator">==</span> C<span class="token punctuation">.</span>UDP <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>adapter<span class="token punctuation">.</span><span class="token function">SupportUDP</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> UDPFallbackMatch<span class="token punctuation">.</span><span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
				log<span class="token punctuation">.</span><span class="token function">Debugln</span><span class="token punctuation">(</span><span class="token string">&quot;[Matcher] %s UDP is not supported, skip match&quot;</span><span class="token punctuation">,</span> adapter<span class="token punctuation">.</span><span class="token function">Name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
				<span class="token keyword">continue</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">return</span> adapter<span class="token punctuation">,</span> rule<span class="token punctuation">,</span> <span class="token boolean">nil</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

  <span class="token comment">// 未匹配上则走直连</span>
	<span class="token keyword">return</span> proxies<span class="token punctuation">[</span><span class="token string">&quot;DIRECT&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

<span class="token comment">// rule/domain_keyword.go</span>
<span class="token comment">// 这里以域名关键字匹配为例</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>dk <span class="token operator">*</span>DomainKeyword<span class="token punctuation">)</span> <span class="token function">Match</span><span class="token punctuation">(</span>metadata <span class="token operator">*</span>C<span class="token punctuation">.</span>Metadata<span class="token punctuation">)</span> <span class="token builtin">bool</span> <span class="token punctuation">{</span>
  <span class="token comment">// 判断传入的域名中是否包含指定的关键字</span>
	<span class="token keyword">return</span> strings<span class="token punctuation">.</span><span class="token function">Contains</span><span class="token punctuation">(</span>metadata<span class="token punctuation">.</span>Host<span class="token punctuation">,</span> dk<span class="token punctuation">.</span>keyword<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面以 domain_keyword 为例讲解了整个匹配的全过程，剩下的几种匹配方式均大同小异，理解了 domain_keyword 读者就可以自己通过阅读源码理解另外几种匹配机制。</p>`,13),o=[e];function c(l,i){return s(),a("div",null,o)}const r=n(p,[["render",c],["__file","clash-rule.html.vue"]]);export{r as default};
