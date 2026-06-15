import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  FileWarning,
  ShieldCheck,
  Zap,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SensitivityLevel } from '@/types';
import { analyzeSensitivity, SENSITIVITY_META } from '@/utils/sensitivity';
import { SensitivityAnalysisPanel } from '@/components/SensitivityAnalysisPanel';
import { SensitivityBadge } from '@/components/Badges';
import { Modal } from '@/components/Common';

const schema = z.object({
  cveId: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^CVE-\d{4}-\d{4,}$/i.test(v.trim()),
      'CVE 编号格式应为 CVE-YYYY-NNNN'
    ),
  title: z.string().min(10, '标题至少 10 个字符，需清晰描述漏洞').max(120, '标题建议控制在 120 字以内'),
  description: z.string().min(30, '漏洞概要描述请详细些，至少 30 字符'),
  affectedVersions: z
    .array(
      z.object({
        vendor: z.string().min(1, '厂商必填'),
        product: z.string().min(1, '产品名必填'),
        versionRange: z.string().min(1, '版本范围必填'),
      })
    )
    .min(1, '至少需填写 1 条受影响版本'),
  reproductionConditions: z.string().min(20, '复现条件请详细描述，至少 20 字符'),
  repairSuggestion: z.string().min(30, '修复建议请详细描述，至少 30 字符'),
  pocCode: z.string().min(30, 'POC 代码过短，请补充完整利用步骤'),
  disclaimerAccepted: z
    .boolean()
    .refine((v) => v === true, '必须先同意免责声明方可提交'),
});

type FormValues = z.infer<typeof schema>;

export default function Submit() {
  const navigate = useNavigate();
  const { currentUser, submitVulnerability, canSubmit, initStore } = useAppStore();
  const [successOpen, setSuccessOpen] = useState(false);
  const [newVulnId, setNewVulnId] = useState<string | null>(null);
  const [overriddenLevel, setOverriddenLevel] = useState<SensitivityLevel | null>(null);

  useEffect(() => {
    initStore();
  }, [initStore]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cveId: '',
      title: '',
      description: '',
      affectedVersions: [{ vendor: '', product: '', versionRange: '' }],
      reproductionConditions: '',
      repairSuggestion: '',
      pocCode: '',
      disclaimerAccepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'affectedVersions',
  });

  const descVal = watch('description') ?? '';
  const pocVal = watch('pocCode') ?? '';

  const analysis = useMemo(
    () => analyzeSensitivity(descVal, pocVal),
    [descVal, pocVal]
  );

  const finalLevel = overriddenLevel ?? analysis.suggestedLevel;

  const onSubmit = async (values: FormValues) => {
    const trimmedValues = {
      ...values,
      cveId: values.cveId?.trim() || undefined,
      title: values.title.trim(),
      description: values.description.trim(),
      reproductionConditions: values.reproductionConditions.trim(),
      repairSuggestion: values.repairSuggestion.trim(),
      pocCode: values.pocCode.trim(),
      affectedVersions: values.affectedVersions.map((v) => ({
        vendor: v.vendor.trim(),
        product: v.product.trim(),
        versionRange: v.versionRange.trim(),
      })),
      disclaimerAccepted: values.disclaimerAccepted,
    };
    const v = submitVulnerability(trimmedValues, finalLevel);
    setNewVulnId(v.id);
    setSuccessOpen(true);
  };

  if (!canSubmit()) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-sens-topsecret/10 border border-sens-topsecret/30 mb-5">
          <ShieldCheck size={28} className="text-sens-topsecret" />
        </div>
        <h2 className="text-xl font-semibold text-gray-100 mb-2">需研究员及以上身份</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          漏洞提交功能仅开放给已审核的安全研究员、授权安全人员和平台管理员。
          如需提交漏洞，请先登录或申请权限。
        </p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          前往登录
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 xl:px-6 py-8">
        <div className="mb-8 animate-stagger-in">
          <div className="inline-flex items-center gap-2 text-[11px] text-cyber-teal uppercase tracking-wider mb-3 font-medium">
            <Zap size={12} /> 研究员工作区
          </div>
          <h1 className="text-2xl font-bold font-mono-display text-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-cyber-teal to-cyan-600 flex items-center justify-center">
              <Upload size={18} className="text-deep-space" />
            </div>
            提交漏洞 POC
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            提交后系统将自动进行敏感级别初判，由管理员最终审核发布
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid xl:grid-cols-[1fr_380px] gap-6"
        >
          <div className="space-y-6 animate-stagger" style={{ ['--stagger' as any]: '60ms' }}>
            <div className="card p-6 space-y-5">
              <div className="grid md:grid-cols-[1fr_1.5fr] gap-5">
                <div>
                  <label className="label">CVE 编号（可选）</label>
                  <input
                    {...register('cveId')}
                    placeholder="如 CVE-2024-12345"
                    className="input-field font-mono-code text-sm uppercase"
                  />
                  {errors.cveId && <p className="text-[11px] text-sens-topsecret mt-1">{errors.cveId.message}</p>}
                </div>
                <div>
                  <label className="label">漏洞标题 *</label>
                  <input
                    {...register('title')}
                    placeholder="简明描述漏洞类型与目标，如：Apache Log4j2 JNDI 注入 RCE"
                    className="input-field"
                  />
                  {errors.title && <p className="text-[11px] text-sens-topsecret mt-1">{errors.title.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">漏洞概要描述 *</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="请详细描述漏洞的成因、触发原理、潜在危害..."
                  className="input-field resize-y"
                />
                <div className="flex justify-between mt-1">
                  {errors.description && <p className="text-[11px] text-sens-topsecret">{errors.description.message}</p>}
                  <p className="text-[11px] text-gray-500 ml-auto">{descVal.length} 字符</p>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="label !mb-0">影响版本范围 *（至少一条）</label>
                <button
                  type="button"
                  onClick={() => append({ vendor: '', product: '', versionRange: '' })}
                  className="btn-secondary !py-1 !px-2.5 text-xs"
                >
                  <Plus size={12} /> 新增一条
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div key={f.id} className="grid md:grid-cols-3 gap-3 items-start">
                    <div>
                      <input
                        {...register(`affectedVersions.${idx}.vendor` as const)}
                        placeholder="厂商（如 Apache）"
                        className="input-field"
                      />
                      {errors.affectedVersions?.[idx]?.vendor && (
                        <p className="text-[11px] text-sens-topsecret mt-1">
                          {errors.affectedVersions[idx]?.vendor?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register(`affectedVersions.${idx}.product` as const)}
                        placeholder="产品（如 Log4j2）"
                        className="input-field"
                      />
                      {errors.affectedVersions?.[idx]?.product && (
                        <p className="text-[11px] text-sens-topsecret mt-1">
                          {errors.affectedVersions[idx]?.product?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          {...register(`affectedVersions.${idx}.versionRange` as const)}
                          placeholder="版本（如 2.0 - 2.14.1）"
                          className="input-field font-mono-code"
                        />
                        {errors.affectedVersions?.[idx]?.versionRange && (
                          <p className="text-[11px] text-sens-topsecret mt-1">
                            {errors.affectedVersions[idx]?.versionRange?.message}
                          </p>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="shrink-0 w-9 h-9 rounded-sm border border-white/10 flex items-center justify-center text-gray-400 hover:text-sens-topsecret hover:border-sens-topsecret/40 transition-colors"
                          title="删除该条"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.affectedVersions && !Array.isArray(errors.affectedVersions) && (
                <p className="text-[11px] text-sens-topsecret">{(errors.affectedVersions as any).message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <label className="label">复现条件 / 环境 *</label>
                <textarea
                  {...register('reproductionConditions')}
                  rows={6}
                  placeholder="1. 目标版本 & 部署方式\n2. 所需账号权限\n3. 特殊配置开关..."
                  className="input-field resize-y h-full"
                />
                {errors.reproductionConditions && (
                  <p className="text-[11px] text-sens-topsecret mt-1">{errors.reproductionConditions.message}</p>
                )}
              </div>
              <div className="card p-6">
                <label className="label">修复建议 *</label>
                <textarea
                  {...register('repairSuggestion')}
                  rows={6}
                  placeholder="1. 升级到哪个版本\n2. 临时缓解方案（WAF / 配置等）\n3. 检测入侵痕迹方法..."
                  className="input-field resize-y h-full"
                />
                {errors.repairSuggestion && (
                  <p className="text-[11px] text-sens-topsecret mt-1">{errors.repairSuggestion.message}</p>
                )}
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="label !mb-0">POC / EXP 源代码 *</label>
                <span className="text-[11px] text-gray-500 font-mono-code">
                  {pocVal.length} 字符 · 自动检测 {pocVal.split('\n').length} 行
                </span>
              </div>
              <Controller
                name="pocCode"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={14}
                    placeholder="# 粘贴 PoC 代码、利用脚本、curl 命令示例等..."
                    className="w-full p-4 font-mono-code text-xs leading-relaxed rounded-sm border border-white/10 bg-[#1a1a1a] text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyber-teal focus:border-cyber-teal/40 resize-y"
                    spellCheck={false}
                  />
                )}
              />
              {errors.pocCode && <p className="text-[11px] text-sens-topsecret">{errors.pocCode.message}</p>}
            </div>

            <div className="card p-5 border-sens-internal/30 bg-sens-internal/5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('disclaimerAccepted')}
                  className="mt-0.5 w-4 h-4 accent-cyber-teal rounded-sm"
                />
                <div className="flex-1 text-xs leading-relaxed">
                  <div className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-sens-internal" />
                    我已阅读并同意《漏洞资料提交免责声明》 *
                  </div>
                  <p className="text-gray-400">
                    本人声明所提交内容为原创研究成果，不包含他人商业机密；
                    所附 POC 代码仅用于授权安全研究，严禁非法用途；
                    同意平台根据敏感级别对内容进行脱敏、分级发布；
                    因违规使用造成的一切法律后果由本人承担。
                  </p>
                </div>
              </label>
              {errors.disclaimerAccepted && (
                <p className="text-[11px] text-sens-topsecret mt-2 ml-7">
                  {errors.disclaimerAccepted.message as string}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-ghost"
              >
                取消
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
                <Send size={16} /> 提交审核
              </button>
            </div>
          </div>

          <div className="space-y-5 self-start xl:sticky xl:top-24">
            <SensitivityAnalysisPanel
              result={analysis}
              onChangeLevel={(l: SensitivityLevel) =>
                setOverriddenLevel(overriddenLevel === l ? null : l)
              }
              currentLevel={finalLevel}
            />

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileWarning size={14} className="text-sens-internal" />
                <h3 className="text-sm font-semibold text-gray-100">最终发布级别预览</h3>
              </div>
              <div className={`p-4 rounded-sm border ${SENSITIVITY_META[finalLevel].bgColor} ${SENSITIVITY_META[finalLevel].borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">管理员审核后可能调整</span>
                  <CheckCircle2 size={14} className={SENSITIVITY_META[finalLevel].color} />
                </div>
                <SensitivityBadge level={finalLevel} size="lg" />
              </div>
            </div>

            <div className="card p-5 space-y-2 text-[11px] text-gray-400 leading-relaxed">
              <div className="text-cyber-teal font-semibold uppercase tracking-wider text-[10px] mb-2">
                提交小贴士
              </div>
              <p>• POC 中请避免出现真实客户域名、IP、账号密码</p>
              <p>• 复现步骤越清晰，审核通过越快</p>
              <p>• 修复建议请注明具体版本号</p>
              <p>• 0day 漏洞请直接联系管理员，避免公网平台明文提交</p>
            </div>
          </div>
        </form>
      </div>

      <Modal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          if (newVulnId) navigate(`/vuln/${newVulnId}`);
        }}
        title="提交成功！"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setSuccessOpen(false);
                navigate('/profile');
              }}
              className="btn-ghost"
            >
              查看我的提交
            </button>
            <button
              onClick={() => {
                setSuccessOpen(false);
                if (newVulnId) navigate(`/vuln/${newVulnId}`);
              }}
              className="btn-primary"
            >
              <CheckCircle2 size={16} /> 查看提交详情
            </button>
          </>
        }
      >
        <div className="py-4 text-center">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-sens-public/15 border-2 border-sens-public/40 mb-5">
            <CheckCircle2 size={32} className="text-sens-public" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100 mb-1.5">漏洞 POC 已提交至审核队列</h3>
          <p className="text-sm text-gray-500">
            平台已完成敏感初判，预计 1-2 个工作日内完成审核。
            如需修改或补充，请在个人中心查看状态。
          </p>
        </div>
      </Modal>
    </div>
  );
}
