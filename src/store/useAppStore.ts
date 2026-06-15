import { create } from 'zustand';
import {
  User,
  Vulnerability,
  UserRole,
  SensitivityLevel,
  VerificationStatus,
  VulnFilter,
  SubmitVulnForm,
  TimelineEvent,
} from '@/types';
import { PRESET_USERS, PRESET_VULNERABILITIES } from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  vulnerabilities: Vulnerability[];
  filters: VulnFilter;
  initialized: boolean;

  initStore: () => void;
  login: (role: UserRole) => void;
  logout: () => void;

  setFilters: (f: Partial<VulnFilter>) => void;
  clearFilters: () => void;

  submitVulnerability: (form: SubmitVulnForm, suggestedLevel: SensitivityLevel) => Vulnerability;
  reviewVulnerability: (
    vulnId: string,
    action: 'verify' | 'reject' | 'desensitize',
    params: { level?: SensitivityLevel; reason?: string; request?: string }
  ) => void;
  submitDesensitized: (vulnId: string, desensitizedCode: string) => void;

  getFilteredVulns: () => Vulnerability[];
  canViewSensitiveLevel: (level: SensitivityLevel) => boolean;
  canAccessReview: () => boolean;
  canSubmit: () => boolean;
  getUserVulns: () => Vulnerability[];
}

const LS_KEYS = {
  USER: 'securevault_current_user',
  VULNS: 'securevault_vulns',
};

const genId = () => Math.random().toString(36).slice(2, 10);

const genVulnCode = (count: number) =>
  `SV-2024-${String(count + 1).padStart(4, '0')}`;

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: PRESET_USERS,
  vulnerabilities: [],
  filters: { keyword: '' },
  initialized: false,

  initStore: () => {
    if (get().initialized) return;

    let currentUser: User | null = null;
    let vulns: Vulnerability[] = [];

    try {
      const savedUser = localStorage.getItem(LS_KEYS.USER);
      const savedVulns = localStorage.getItem(LS_KEYS.VULNS);
      if (savedUser) currentUser = JSON.parse(savedUser);
      if (savedVulns) {
        vulns = JSON.parse(savedVulns);
      } else {
        vulns = PRESET_VULNERABILITIES;
        localStorage.setItem(LS_KEYS.VULNS, JSON.stringify(vulns));
      }
    } catch {
      vulns = PRESET_VULNERABILITIES;
    }

    set({ currentUser, vulnerabilities: vulns, initialized: true });
  },

  login: (role: UserRole) => {
    const user = PRESET_USERS.find((u) => u.role === role);
    if (user) {
      try {
        localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
      } catch {}
      set({ currentUser: user });
    }
  },

  logout: () => {
    try {
      localStorage.removeItem(LS_KEYS.USER);
    } catch {}
    set({ currentUser: null });
  },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: { keyword: '' } }),

  submitVulnerability: (form, suggestedLevel) => {
    const state = get();
    const user = state.currentUser!;
    const now = new Date().toISOString();
    const newVuln: Vulnerability = {
      id: `vuln-${genId()}`,
      vulnCode: genVulnCode(state.vulnerabilities.length),
      cveId: form.cveId || undefined,
      title: form.title,
      description: form.description,
      affectedVersions: form.affectedVersions.filter(
        (v) => v.vendor && v.product && v.versionRange
      ),
      reproductionConditions: form.reproductionConditions,
      repairSuggestion: form.repairSuggestion,
      pocCode: form.pocCode,
      sensitivityLevel: suggestedLevel,
      verificationStatus: VerificationStatus.PENDING,
      submitterId: user.id,
      submitterName: user.displayName.split('·')[0].trim(),
      submittedAt: now,
      disclaimerAccepted: form.disclaimerAccepted,
      timeline: [
        {
          id: `tl-${genId()}`,
          type: 'submit',
          operatorName: user.displayName.split('·')[0].trim(),
          operatorRole: user.role,
          timestamp: now,
          comment: '研究员提交漏洞报告',
        },
      ],
    };

    const newVulns = [newVuln, ...state.vulnerabilities];
    try {
      localStorage.setItem(LS_KEYS.VULNS, JSON.stringify(newVulns));
    } catch {}
    set({ vulnerabilities: newVulns });
    return newVuln;
  },

  reviewVulnerability: (vulnId, action, params) => {
    const state = get();
    const admin = state.currentUser!;
    const now = new Date().toISOString();
    const adminName = admin.displayName.split('·')[0].trim();

    const newVulns = state.vulnerabilities.map((v) => {
      if (v.id !== vulnId) return v;
      const updates: Partial<Vulnerability> = {
        reviewedAt: now,
        reviewerId: admin.id,
        reviewerName: adminName,
      };

      const newTimeline = [...v.timeline];

      if (action === 'verify') {
        updates.verificationStatus = VerificationStatus.VERIFIED;
        updates.sensitivityLevel = params.level ?? v.sensitivityLevel;
        newTimeline.push({
          id: `tl-${genId()}`,
          type: 'publish',
          operatorName: adminName,
          operatorRole: UserRole.ADMIN,
          timestamp: now,
          comment: `审核通过，定级为 ${params.level ?? v.sensitivityLevel}`,
        });
      } else if (action === 'reject') {
        updates.verificationStatus = VerificationStatus.REJECTED;
        updates.rejectReason = params.reason;
        newTimeline.push({
          id: `tl-${genId()}`,
          type: 'reject',
          operatorName: adminName,
          operatorRole: UserRole.ADMIN,
          timestamp: now,
          comment: `驳回: ${params.reason}`,
        });
      } else if (action === 'desensitize') {
        updates.verificationStatus = VerificationStatus.DESENSITIZATION;
        updates.sensitivityLevel = params.level ?? v.sensitivityLevel;
        updates.desensitizationRequest = params.request;
        newTimeline.push({
          id: `tl-${genId()}`,
          type: 'desensitize',
          operatorName: adminName,
          operatorRole: UserRole.ADMIN,
          timestamp: now,
          comment: `要求脱敏: ${params.request}`,
        });
      }

      updates.timeline = newTimeline;
      return { ...v, ...updates };
    });

    try {
      localStorage.setItem(LS_KEYS.VULNS, JSON.stringify(newVulns));
    } catch {}
    set({ vulnerabilities: newVulns });
  },

  submitDesensitized: (vulnId, desensitizedCode) => {
    const state = get();
    const user = state.currentUser!;
    const now = new Date().toISOString();
    const userName = user.displayName.split('·')[0].trim();

    const newVulns = state.vulnerabilities.map((v) => {
      if (v.id !== vulnId) return v;
      const newTl: TimelineEvent = {
        id: `tl-${genId()}`,
        type: 'update',
        operatorName: userName,
        operatorRole: user.role,
        timestamp: now,
        comment: '提交脱敏后版本',
      };
      return {
        ...v,
        pocCodeDesensitized: desensitizedCode,
        verificationStatus: VerificationStatus.PENDING,
        timeline: [...v.timeline, newTl],
      };
    });

    try {
      localStorage.setItem(LS_KEYS.VULNS, JSON.stringify(newVulns));
    } catch {}
    set({ vulnerabilities: newVulns });
  },

  getFilteredVulns: () => {
    const { vulnerabilities, filters, currentUser } = get();
    const authorizedScope =
      currentUser?.authorizedScope ?? [SensitivityLevel.PUBLIC];

    return vulnerabilities.filter((v) => {
      if (!authorizedScope.includes(v.sensitivityLevel)) return false;
      if (
        filters.keyword &&
        !(
          v.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          v.vulnCode.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          (v.cveId ?? '').toLowerCase().includes(filters.keyword.toLowerCase()) ||
          v.description.toLowerCase().includes(filters.keyword.toLowerCase())
        )
      )
        return false;
      if (filters.sensitivity && filters.sensitivity.length > 0) {
        if (!filters.sensitivity.includes(v.sensitivityLevel)) return false;
      }
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(v.verificationStatus)) return false;
      }
      if (filters.product) {
        const match = v.affectedVersions.some(
          (av) =>
            av.product.toLowerCase().includes(filters.product!.toLowerCase()) ||
            av.vendor.toLowerCase().includes(filters.product!.toLowerCase())
        );
        if (!match) return false;
      }
      if (filters.dateFrom && v.submittedAt < filters.dateFrom) return false;
      if (filters.dateTo && v.submittedAt > filters.dateTo) return false;
      return true;
    });
  },

  canViewSensitiveLevel: (level: SensitivityLevel) => {
    const scope = get().currentUser?.authorizedScope ?? [];
    return scope.includes(level);
  },

  canAccessReview: () => {
    const role = get().currentUser?.role;
    return role === UserRole.ADMIN;
  },

  canSubmit: () => {
    const role = get().currentUser?.role;
    return (
      role === UserRole.RESEARCHER ||
      role === UserRole.AUTHORIZED ||
      role === UserRole.ADMIN
    );
  },

  getUserVulns: () => {
    const uid = get().currentUser?.id;
    if (!uid) return [];
    return get().vulnerabilities.filter((v) => v.submitterId === uid);
  },
}));
