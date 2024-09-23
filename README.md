# Serv00-auto-login
Serv00控制面板自动登录脚本

## 使用方法
　　在 GitHub 仓库中，进入右上角`Settings`，在侧边栏找到`Secrets and variables`，点击展开选择`Actions`，点击`New repository secret`，然后创建一个名为`ACCOUNTS_JSON`的`Secret`，将 JSON 格式的账号密码字符串作为它的值，如下格式：  
```
[  
  { "username": "username1", "password": "linux.do", "panelnum": "0" },  
  { "username": "username2", "password": "mima2", "panelnum": "2" },  
  { "username": "username3", "password": "mima3", "panelnum": "3" }  
]
```
> `username`填你的serv00账号 `password`你的登录密码 `panelnum`参数为面板编号，即为你所收到注册邮件的`panel*.serv00.com`中的`*`数值，简单点说你是S几的就填数字几。

## SSH登录不上

> 登录不上是因为Ban IP, 点击此处解锁： [Ban](https://www.serv00.com/ip_unban/)

> 还是登录不上的话： 请使用`FinalShell`，并勾上 `智能海外加速`，登录失败在弹出框选择`取消`，在弹出框填入`[邮件中的SSH密码]`
