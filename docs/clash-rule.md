# clash rule

## 前言

Clash 是一款基于规则的跨平台代理软件，支持 Windows，macOS，Linux 操作系统。它可以帮助用户实现网络访问控制等需求。

Clash 使用规则文件来控制流量，规则文件的作用是告诉 Clash 哪些流量需要代理，哪些流量不需要代理。规则文件是文本文件，其中包含了一些规则，可以根据规则的匹配结果来选择是否使用代理。

在 Clash 规则文件中，最重要的是 Proxy 和 Rule 两个关键词。Proxy 定义了代理服务器的信息，Rule 定义了使用代理的规则。在 Rule 中，可以使用不同的匹配方式来匹配请求的目标地址或域名，从而选择是否使用代理。

## Clash 规则的基础语法

Clash 规则采用 YAML 格式，采用了缩进表示层次关系，rule 分为三个部分，`<匹配规则>,<匹配规则的参数>,<代理节点>`。下面是一个简单的 Clash 规则示例：

```yaml
rules:
  - DOMAIN-SUFFIX,google.com,proxy
  - DOMAIN,google.com,proxy
  - DOMAIN-KEYWORD,google.com,proxy
  - GEOIP,CN,DIRECT
```

## Clash 规则匹配实现原理

Clash 规则匹配的基本原理是将流量的各个部分（如域名、IP、端口等）与规则进行匹配，以确定是否应该代理该流量。例如上述示例中的 DOMAIN 和 GEOIP 就是对域名和 IP 进行匹配。

Clash 规则匹配的源代码在 clash/rule 文件夹下面，例如上面的 DOMAIN-KEYWORD, GEOIP 对应文件是 domain_keyword.go, geoip.go。下面通过源代码来学习规则匹配的原理，首先从 TCP 代理的入口开始看。

```go
// tunnel/tunnel.go
func handleTCPConn(connCtx C.ConnContext) {
  metadata := connCtx.Metadata()
  // ...

  // 该行代码最终返回的 proxy 就是匹配中的代理节点，rule 则是使用的代理规则
	proxy, rule, err := resolveMetadata(connCtx, metadata)
}

var (
  proxies = make(map[string]C.Proxy)
)

func resolveMetadata(ctx C.PlainContext, metadata *C.Metadata) (proxy C.Proxy, rule C.Rule, err error) {
  // 元信息中指定了代理则直接走指定的代理
	if metadata.SpecialProxy != "" {
		var exist bool
		proxy, exist = proxies[metadata.SpecialProxy]
		if !exist {
			err = fmt.Errorf("proxy %s not found", metadata.SpecialProxy)
		}
		return
	}

  
	switch mode {
  // 判断当前的模式，如果为 DIRECT 模式则选择 DIRECT 对应的节点
	case Direct:
		proxy = proxies["DIRECT"]
  // 判断当前的模式，如果为 GLOBAL 模式则选择 GLOBAL 对应的节点
	case Global:
		proxy = proxies["GLOBAL"]
	// 如果不是前两种模式则走规则匹配
	default:
		proxy, rule, err = match(metadata)
	}
	return
}

func match(metadata *C.Metadata) (C.Proxy, C.Rule, error) {
	configMux.RLock()
	defer configMux.RUnlock()

	var resolved bool
	var processFound bool

  // 进行 DNS 解析
	if node := resolver.DefaultHosts.Search(metadata.Host); node != nil {
		ip := node.Data.(net.IP)
		metadata.DstIP = ip
		resolved = true
	}

	for _, rule := range rules {
		//...

    // 下面的 Match 进行规则匹配
		if rule.Match(metadata) {
      // 匹配上后通过 rule.Adapter() 找到对应的代理节点也就是 adapter 然后返回
			adapter, ok := proxies[rule.Adapter()]
			if !ok {
				continue
			}

			if metadata.NetWork == C.UDP && !adapter.SupportUDP() && UDPFallbackMatch.Load() {
				log.Debugln("[Matcher] %s UDP is not supported, skip match", adapter.Name())
				continue
			}
			return adapter, rule, nil
		}
	}

  // 未匹配上则走直连
	return proxies["DIRECT"], nil, nil
}

// rule/domain_keyword.go
// 这里以域名关键字匹配为例

func (dk *DomainKeyword) Match(metadata *C.Metadata) bool {
  // 判断传入的域名中是否包含指定的关键字
	return strings.Contains(metadata.Host, dk.keyword)
}
```

上面以 domain_keyword 为例讲解了整个匹配的全过程，剩下的几种匹配方式均大同小异，理解了 domain_keyword 读者就可以自己通过阅读源码理解另外几种匹配机制。

