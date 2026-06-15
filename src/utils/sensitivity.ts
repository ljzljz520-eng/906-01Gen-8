import {
  SensitivityLevel,
  VerificationStatus,
  SensitivityAnalysisResult,
  SensitivityKeywordMatch,
} from '@/types';

const RULES: Array<{
  pattern: RegExp;
  keyword: string;
  suggestedLevel: SensitivityLevel;
  triggerDesensitization?: boolean;
  hint?: string;
}> = [
  {
    pattern: /(0day|0-day|0日|未公开|nday|n-day)/i,
    keyword: '0day/未公开漏洞',
    suggestedLevel: SensitivityLevel.TOP_SECRET,
    hint: '检测到未公开漏洞标识，此类漏洞杀伤力极高，请严格控制分发范围',
  },
  {
    pattern: /(RCE|远程命令|命令执行|代码执行|rce|exec\(|system\(|shell_exec|passthru|Runtime\.getRuntime)/i,
    keyword: 'RCE/远程代码执行',
    suggestedLevel: SensitivityLevel.CONFIDENTIAL,
    hint: '检测到远程代码执行利用代码，建议限制为机密级别',
  },
  {
    pattern: /(SQL注入|SQLi|union\s+select|sqlmap|information_schema|--\s|or\s+1=1)/i,
    keyword: 'SQL 注入',
    suggestedLevel: SensitivityLevel.CONFIDENTIAL,
    hint: '检测到 SQL 注入相关利用，请评估数据泄露风险',
  },
  {
    pattern: /(webshell|菜刀|蚁剑|冰蝎|behinder|antsword|大马|小马|后门|backdoor)/i,
    keyword: 'Webshell/后门工具',
    suggestedLevel: SensitivityLevel.TOP_SECRET,
    hint: '检测到 webshell 或后门代码，此内容严禁对外公开',
  },
  {
    pattern: /CVE-202[45]-\d{4,}/i,
    keyword: '较新 CVE 编号',
    suggestedLevel: SensitivityLevel.INTERNAL,
    hint: '检测到 2024/2025 年度 CVE 编号，建议提升为内部级别',
  },
  {
    pattern: /(硬编码|hardcode|password|passwd|secret|凭证|token|api[_-]?key|authorization)/i,
    keyword: '敏感凭证/密钥',
    suggestedLevel: SensitivityLevel.INTERNAL,
    triggerDesensitization: true,
    hint: '检测到疑似硬编码凭证、密码、Token，请务必脱敏后再提交',
  },
  {
    pattern: /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
    keyword: 'IP 地址',
    suggestedLevel: SensitivityLevel.PUBLIC,
    triggerDesensitization: true,
    hint: '检测到 IP 地址，请替换为示例地址（如 192.168.xxx.xxx）',
  },
  {
    pattern: /(SSRF|服务端请求伪造|file_get_contents|curl_exec|fsockopen)/i,
    keyword: 'SSRF',
    suggestedLevel: SensitivityLevel.INTERNAL,
    hint: '检测到 SSRF 相关漏洞，请确认是否包含内网探测 payload',
  },
  {
    pattern: /(反序列化|deserialize|unserialize|pickle|ObjectInputStream|ysoserial)/i,
    keyword: '反序列化',
    suggestedLevel: SensitivityLevel.CONFIDENTIAL,
    hint: '检测到反序列化利用链，请谨慎处理',
  },
  {
    pattern: /(文件上传|file\s*upload|multipart\/form-data|move_uploaded_file)/i,
    keyword: '文件上传漏洞',
    suggestedLevel: SensitivityLevel.INTERNAL,
    hint: '检测到文件上传漏洞利用代码',
  },
  {
    pattern: /(XSS|跨站脚本|cross\s*site\s*scripting|<script>.*<\/script>|alert\(document\.cookie\))/i,
    keyword: 'XSS/跨站脚本',
    suggestedLevel: SensitivityLevel.PUBLIC,
    hint: '检测到 XSS 相关 payload',
  },
  {
    pattern: /(越权|未授权|unauthorized|horizontal\s*privilege|IDOR|insecure\s*direct)/i,
    keyword: '越权/未授权访问',
    suggestedLevel: SensitivityLevel.INTERNAL,
    hint: '检测到权限绕过相关漏洞',
  },
];

const LEVEL_ORDER: Record<SensitivityLevel, number> = {
  [SensitivityLevel.PUBLIC]: 0,
  [SensitivityLevel.INTERNAL]: 1,
  [SensitivityLevel.CONFIDENTIAL]: 2,
  [SensitivityLevel.TOP_SECRET]: 3,
};

export function analyzeSensitivity(
  description: string,
  pocCode: string
): SensitivityAnalysisResult {
  const fullText = `${description}\n${pocCode}`;
  const matches: SensitivityKeywordMatch[] = [];
  let highestLevel = SensitivityLevel.PUBLIC;
  let needDesensitization = false;
  const desensitizationHints: string[] = [];
  let riskScore = 10;

  for (const rule of RULES) {
    const match = fullText.match(rule.pattern);
    if (match) {
      matches.push({
        keyword: rule.keyword,
        pattern: rule.pattern.toString(),
        suggestedLevel: rule.suggestedLevel,
        highlight: match[0].slice(0, 40),
        triggerDesensitization: rule.triggerDesensitization,
      });

      if (
        LEVEL_ORDER[rule.suggestedLevel] > LEVEL_ORDER[highestLevel]
      ) {
        highestLevel = rule.suggestedLevel;
      }

      if (rule.triggerDesensitization) {
        needDesensitization = true;
        if (rule.hint) {
          desensitizationHints.push(rule.hint);
        }
      } else if (rule.hint && rule.suggestedLevel !== SensitivityLevel.PUBLIC) {
        desensitizationHints.push(rule.hint);
      }

      riskScore += (LEVEL_ORDER[rule.suggestedLevel] + 1) * 15;
    }
  }

  if (pocCode.length > 2000) riskScore += 20;
  if (riskScore > 100) riskScore = 100;

  return {
    suggestedLevel: highestLevel,
    matches,
    riskScore,
    needDesensitization,
    desensitizationHints: Array.from(new Set(desensitizationHints)),
  };
}

export const SENSITIVITY_META: Record<
  SensitivityLevel,
  { label: string; shortLabel: string; color: string; bgColor: string; borderColor: string; dotColor: string; icon: string }
> = {
  [SensitivityLevel.PUBLIC]: {
    label: '公开',
    shortLabel: 'PUB',
    color: 'text-sens-public',
    bgColor: 'bg-sens-public/10',
    borderColor: 'border-sens-public/40',
    dotColor: 'bg-sens-public',
    icon: 'globe',
  },
  [SensitivityLevel.INTERNAL]: {
    label: '内部',
    shortLabel: 'INT',
    color: 'text-sens-internal',
    bgColor: 'bg-sens-internal/10',
    borderColor: 'border-sens-internal/40',
    dotColor: 'bg-sens-internal',
    icon: 'shield-half',
  },
  [SensitivityLevel.CONFIDENTIAL]: {
    label: '机密',
    shortLabel: 'CONF',
    color: 'text-sens-confidential',
    bgColor: 'bg-sens-confidential/10',
    borderColor: 'border-sens-confidential/40',
    dotColor: 'bg-sens-confidential',
    icon: 'shield-alert',
  },
  [SensitivityLevel.TOP_SECRET]: {
    label: '绝密',
    shortLabel: 'TOP',
    color: 'text-sens-topsecret',
    bgColor: 'bg-sens-topsecret/10',
    borderColor: 'border-sens-topsecret/40',
    dotColor: 'bg-sens-topsecret',
    icon: 'lock-keyhole',
  },
};

export const STATUS_META: Record<
  VerificationStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  [VerificationStatus.PENDING]: {
    label: '待审核',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/40',
  },
  [VerificationStatus.DESENSITIZATION]: {
    label: '待脱敏',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/40',
  },
  [VerificationStatus.VERIFIED]: {
    label: '已验证',
    color: 'text-sens-public',
    bgColor: 'bg-sens-public/10',
    borderColor: 'border-sens-public/40',
  },
  [VerificationStatus.REJECTED]: {
    label: '已驳回',
    color: 'text-sens-topsecret',
    bgColor: 'bg-sens-topsecret/10',
    borderColor: 'border-sens-topsecret/40',
  },
};

export const ROLE_META: Record<
  string,
  { label: string; color: string }
> = {
  guest: { label: '访客', color: 'text-gray-400' },
  researcher: { label: '研究员', color: 'text-cyan-400' },
  authorized: { label: '授权人员', color: 'text-purple-400' },
  admin: { label: '管理员', color: 'text-sens-topsecret' },
};
