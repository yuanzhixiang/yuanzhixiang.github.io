# clash tunnel

## Tunnel 概述

在计算机网络中，Tunnel是一种通过在不同的网络之间创建虚拟通道来进行数据传输的技术。Tunnel可以被用来隐藏数据的源和目的地，同时也可以用来绕过网络中的限制和防火墙。

Tunnel 可被用于以下场景：

- 加密保护：Tunnel 可以用来加密和隐藏网络中的通信数据，从而保证通信的安全性和隐私性。
- 绕过限制：Tunnel 可以用来绕过网络中的限制和防火墙，访问被封锁的网站和服务。
- 负载均衡：Tunnel 可以用来实现负载均衡，将请求分发到多个服务器上进行处理。
- 网络加速：Tunnel 可以用来加速网络传输，通过对数据进行压缩和优化来减少传输时间和带宽占用。
- 数据中转：Tunnel 可以用来实现数据中转，将数据从一个网络传输到另一个网络。

## 代理连接

接下来，我们通过学习 Clash 的 TCP 连接源码，了解该功能的实现原理。在代码中，代理连接是通过 proxy.DialContext 函数来创建的。其中，DialContext 函数会创建一个新的连接并返回一个 net.Conn 接口类型的对象，该对象可以被用于数据传输。在目标连接创建后，通过将源连接和目标连接的数据进行双向拷贝，完成数据传输，从而达到 tunnel 的效果。同时，在实现过程中，还使用了一个巧妙的技巧——通过 ReadOnlyReader 和 WriteOnlyWriter 对连接进行包装，避免使用 net.TCPConn 的 ReadFrom 方法，从而提高了性能。在进行数据传输的过程中，还使用了多个 goroutine 进行调度和优化，提高了程序的运行效率。

```go
// context/conn.go
type ConnContext struct {
	id       uuid.UUID
	metadata *C.Metadata
	conn     net.Conn
}

// tunnel/tunnel.go
// 连接建立时会调用这个方法，connCtx 中的 conn 就是连接到 clash 的连接
func handleTCPConn(connCtx C.ConnContext) {
  metadata := connCtx.Metadata()
  // ...

  // metadata 中存放着源地址和目标地址，进入该函数后会使用远程地址创建连接并将其返回，也就是 remoteConn
  remoteConn, err := proxy.DialContext(ctx, metadata.Pure())

  // 远程连接建立后通过调用 handleSocket 方法完成对数据的双向拷贝
  handleSocket(connCtx, remoteConn)
}

// tunnel/connection.go
import (
  N "github.com/Dreamacro/clash/common/net"
)
func handleSocket(ctx C.ConnContext, outbound net.Conn) {
	N.Relay(ctx.Conn(), outbound)
}

// common/net/relay.go
// Relay copies between left and right bidirectionally.
func Relay(leftConn, rightConn net.Conn) {
	ch := make(chan error)

  // 开启携程从目标服务器读取的数据写入源客户端
	go func() {
		_, err := io.Copy(WriteOnlyWriter{Writer: leftConn}, ReadOnlyReader{Reader: rightConn})
		leftConn.SetReadDeadline(time.Now())
		ch <- err
	}()

  // 从源客户端读取的数据写入目标服务器
	io.Copy(WriteOnlyWriter{Writer: rightConn}, ReadOnlyReader{Reader: leftConn})
	rightConn.SetReadDeadline(time.Now())
	<-ch
}
```

# 总结

Clash 的 Tunnel 功能可以用于加密保护、绕过限制、负载均衡、网络加速和数据中转等场景。Tunnel 功能是一个强大的网络传输技术，为用户提供了一种安全、高效、稳定的数据传输方式。
