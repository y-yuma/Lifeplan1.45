import { create } from 'zustand';
import { calculateNetIncomeWithRaise, calculateHousingExpense, calculatePension } from '@/lib/calculations';

type Occupation = 'company_employee' | 'part_time_with_pension' | 'part_time_without_pension' | 'self_employed' | 'homemaker';

// Income types
export interface IncomeItem {
  id: string;
  name: string;
  type: 'income' | 'profit' | 'side';
  amounts: { [year: number]: number };
  // 以下の投資関連プロパティを追加
  investmentRatio: number; // 投資に回す割合 (%)
  maxInvestmentAmount: number; // 最大投資額 (万円/年)
}

export interface IncomeSection {
  personal: IncomeItem[];
  corporate: IncomeItem[];
}

// Expense types
export interface ExpenseItem {
  id: string;
  name: string;
  type: 'living' | 'housing' | 'education' | 'other';
  amounts: { [year: number]: number };
}

export interface ExpenseSection {
  personal: ExpenseItem[];
  corporate: ExpenseItem[];
}

// Asset types
export interface AssetItem {
  id: string;
  name: string;
  type: 'cash' | 'investment' | 'property' | 'other';
  amounts: { [year: number]: number };
}

export interface AssetSection {
  personal: AssetItem[];
  corporate: AssetItem[];
}

// Liability types
export interface LiabilityItem {
  id: string;
  name: string;
  type: 'loan' | 'credit' | 'other';
  amounts: { [year: number]: number };
}

export interface LiabilitySection {
  personal: LiabilityItem[];
  corporate: LiabilityItem[];
}

// History types
export interface HistoryEntry {
  timestamp: number;
  type: 'income' | 'expense' | 'asset' | 'liability';
  section: 'personal' | 'corporate';
  itemId: string;
  year: number;
  previousValue: number;
  newValue: number;
}

export interface BasicInfo {
  currentAge: number;
  startYear: number;
  deathAge: number;
  gender: 'male' | 'female';
  monthlyLivingExpense: number;
  occupation: Occupation;
  maritalStatus: 'single' | 'married' | 'planning';
  housingInfo: {
    type: 'rent' | 'own';
    rent?: {
      monthlyRent: number;
      annualIncreaseRate: number;
      renewalFee: number;
      renewalInterval: number;
    };
    own?: {
      purchaseYear: number;
      purchasePrice: number;
      loanAmount: number;
      interestRate: number;
      loanTermYears: number;
      maintenanceCostRate: number;
    };
  };
  spouseInfo?: {
    age?: number;
    currentAge?: number;
    marriageAge?: number;
    occupation?: Occupation;
    additionalExpense?: number;
  };
  children: {
    currentAge: number;
    educationPlan: {
      nursery: string;
      preschool: string;
      elementary: string;
      juniorHigh: string;
      highSchool: string;
      university: string;
    };
  }[];
  plannedChildren: {
    yearsFromNow: number;
    educationPlan: {
      nursery: string;
      preschool: string;
      elementary: string;
      juniorHigh: string;
      highSchool: string;
      university: string;
    };
  }[];
}

export interface Parameters {
  inflationRate: number;
  educationCostIncreaseRate: number;
  investmentReturn: number;
}

export interface CashFlowData {
  [year: number]: {
    mainIncome: number;
    sideIncome: number;
    spouseIncome: number;
    investmentIncome: number; // 運用収益
    livingExpense: number;
    housingExpense: number;
    educationExpense: number;
    otherExpense: number;
    personalAssets: number;
    investmentAmount: number; // 追加: 投資に回した金額
    totalInvestmentAssets: number; // 追加: 運用資産合計
    personalBalance: number;
    personalTotalAssets: number;
    corporateIncome: number;
    corporateOtherIncome: number;
    corporateExpense: number;
    corporateOtherExpense: number;
    corporateBalance: number;
    corporateTotalAssets: number;
  };
}

interface SimulatorState {
  currentStep: number;
  basicInfo: BasicInfo;
  parameters: Parameters;
  cashFlow: CashFlowData;
  history: HistoryEntry[];
  
  // Form data
  incomeData: IncomeSection;
  expenseData: ExpenseSection;
  assetData: AssetSection;
  liabilityData: LiabilitySection;

  // Actions
  setCurrentStep: (step: number) => void;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  setParameters: (params: Partial<Parameters>) => void;
  setCashFlow: (data: CashFlowData) => void;
  updateCashFlowValue: (year: number, field: keyof CashFlowData[number], value: number) => void;
  initializeCashFlow: () => void;
  initializeFormData: () => void;
  syncCashFlowFromFormData: () => void;

  // Form data actions
  setIncomeData: (data: IncomeSection) => void;
  setExpenseData: (data: ExpenseSection) => void;
  setAssetData: (data: AssetSection) => void;
  setLiabilityData: (data: LiabilitySection) => void;
  
  // History actions
  addHistoryEntry: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  currentStep: 1,
  basicInfo: {
    currentAge: 30,
    startYear: new Date().getFullYear(),
    deathAge: 80,
    gender: 'male',
    monthlyLivingExpense: 0,
    occupation: 'company_employee',
    maritalStatus: 'single',
    housingInfo: {
      type: 'rent',
      rent: {
        monthlyRent: 0,
        annualIncreaseRate: 0,
        renewalFee: 0,
        renewalInterval: 2,
      },
    },
    children: [],
    plannedChildren: [],
  },
 parameters: {
  inflationRate: 1.0,
  educationCostIncreaseRate: 1.0,
  investmentReturn: 1.0,
  investmentRatio: 10.0, // 追加: 初期投資割合 10%
  maxInvestmentAmount: 100.0, // 追加: 初期最大投資額 100万円
},
  cashFlow: {},
  history: [],

  // Initialize form data
  incomeData: {
    personal: [
      { id: '1', name: '給与収入', type: 'income', amounts: {} },
      { id: '2', name: '事業収入', type: 'profit', amounts: {} },
      { id: '3', name: '副業収入', type: 'side', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '売上', type: 'income', amounts: {} },
      { id: '2', name: 'その他収入', type: 'income', amounts: {} },
    ],
  },
  expenseData: {
    personal: [
      { id: '1', name: '生活費', type: 'living', amounts: {} },
      { id: '2', name: '住居費', type: 'housing', amounts: {} },
      { id: '3', name: '教育費', type: 'education', amounts: {} },
      { id: '4', name: 'その他', type: 'other', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '事業経費', type: 'other', amounts: {} },
      { id: '2', name: 'その他経費', type: 'other', amounts: {} },
    ],
  },
  assetData: {
    personal: [
      { id: '1', name: '現金・預金', type: 'cash', amounts: {} },
      { id: '2', name: '株式', type: 'investment', amounts: {} },
      { id: '3', name: '投資信託', type: 'investment', amounts: {} },
      { id: '4', name: '不動産', type: 'property', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '現金預金', type: 'cash', amounts: {} },
      { id: '2', name: '設備', type: 'property', amounts: {} },
      { id: '3', name: '在庫', type: 'other', amounts: {} },
    ],
  },
  liabilityData: {
    personal: [
      { id: '1', name: 'ローン', type: 'loan', amounts: {} },
      { id: '2', name: 'クレジット残高', type: 'credit', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '借入金', type: 'loan', amounts: {} },
      { id: '2', name: '未払金', type: 'other', amounts: {} },
    ],
  },

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setBasicInfo: (info) => {
    set((state) => ({ basicInfo: { ...state.basicInfo, ...info } }));
    get().initializeFormData();
    get().initializeCashFlow();
  },
  
  setParameters: (params) => {
    set((state) => ({ parameters: { ...state.parameters, ...params } }));
    get().initializeCashFlow();
  },
  
  setCashFlow: (data) => set({ cashFlow: data }),
  
  updateCashFlowValue: (year, field, value) => {
    const roundedValue = Number(value.toFixed(1));
    set((state) => ({
      cashFlow: {
        ...state.cashFlow,
        [year]: {
          ...state.cashFlow[year],
          [field]: roundedValue,
        },
      },
    }));
    get().initializeCashFlow();
  },

syncCashFlowFromFormData: () => {
  const state = get();
  const { basicInfo, parameters, incomeData, expenseData, assetData, liabilityData } = state;
  const yearsUntilDeath = basicInfo.deathAge - basicInfo.currentAge;
  const years = Array.from(
    { length: yearsUntilDeath + 1 },
    (_, i) => basicInfo.startYear + i
  );

  const newCashFlow: CashFlowData = {};

  // 初期資産と負債の計算
  const calculateTotalAssets = (section: 'personal' | 'corporate') => {
    return state.assetData[section].reduce((total, asset) => {
      const currentYearAmount = asset.amounts[basicInfo.startYear] || 0;
      return total + currentYearAmount;
    }, 0);
  };

  const calculateTotalLiabilities = (section: 'personal' | 'corporate') => {
    return state.liabilityData[section].reduce((total, liability) => {
      const currentYearAmount = liability.amounts[basicInfo.startYear] || 0;
      return total + currentYearAmount;
    }, 0);
  };

  // 運用資産の計算（isInvestment フラグがついているもののみ）
  const calculateInvestmentAssets = (section: 'personal' | 'corporate', year: number) => {
    return state.assetData[section].reduce((total, asset) => {
      if (asset.isInvestment) {
        return total + (asset.amounts[year] || 0);
      }
      return total;
    }, 0);
  };

  const initialPersonalAssets = calculateTotalAssets('personal');
  const initialPersonalLiabilities = calculateTotalLiabilities('personal');
  const initialCorporateAssets = calculateTotalAssets('corporate');
  const initialCorporateLiabilities = calculateTotalLiabilities('corporate');
  const initialInvestmentAssets = calculateInvestmentAssets('personal', basicInfo.startYear);

  let prevYearInvestmentAssets = initialInvestmentAssets;

  years.forEach((year) => {
    const yearsSinceStart = year - basicInfo.startYear;
    const age = basicInfo.currentAge + yearsSinceStart;
    const inflationMultiplier = Math.pow(1 + parameters.inflationRate / 100, yearsSinceStart);

    // 前年のデータを取得
    const prevYear = year - 1;
    const prevYearData = prevYear in newCashFlow ? newCashFlow[prevYear] : null;
    
    // 個人収入の計算
    const mainIncome = incomeData.personal.find(i => i.name === '給与収入')?.amounts[year] || 0;
    const sideIncome = incomeData.personal.find(i => i.name === '副業収入')?.amounts[year] || 0;
    const spouseIncome = incomeData.personal.find(i => i.name === '配偶者収入')?.amounts[year] || 0;
    
    // 法人収入の計算
    const corporateIncome = incomeData.corporate.find(i => i.name === '売上')?.amounts[year] || 0;
    const corporateOtherIncome = incomeData.corporate.find(i => i.name === 'その他収入')?.amounts[year] || 0;

    // 支出の計算
    const livingExpense = expenseData.personal.find(e => e.name === '生活費')?.amounts[year] || 0;
    const housingExpense = expenseData.personal.find(e => e.name === '住居費')?.amounts[year] || 0;
    const educationExpense = expenseData.personal.find(e => e.name === '教育費')?.amounts[year] || 0;
    const otherExpense = expenseData.personal.find(e => e.name === 'その他')?.amounts[year] || 0;

    const corporateExpense = expenseData.corporate.find(e => e.name === '事業経費')?.amounts[year] || 0;
    const corporateOtherExpense = expenseData.corporate.find(e => e.name === 'その他経費')?.amounts[year] || 0;

    // 投資への振り分け額の計算
    let investmentAmount = 0;
    
    // 収入ごとに投資額を計算
    incomeData.personal.forEach(incomeItem => {
      const amount = incomeItem.amounts[year] || 0;
      if (amount > 0 && incomeItem.investmentRatio > 0) {
        // 投資割合に基づく投資額
        const itemInvestmentAmount = Math.min(
          amount * (incomeItem.investmentRatio / 100),
          incomeItem.maxInvestmentAmount || Infinity
        );
        investmentAmount += itemInvestmentAmount;
      }
    });

    // 総資産と前年の投資資産の取得
    const prevPersonalAssets = prevYear in newCashFlow ? 
      newCashFlow[prevYear].personalTotalAssets : 
      initialPersonalAssets - initialPersonalLiabilities;
    
    const prevCorporateAssets = prevYear in newCashFlow ? 
      newCashFlow[prevYear].corporateTotalAssets : 
      initialCorporateAssets - initialCorporateLiabilities;

    // 運用収益の計算（前年の運用資産に利回りを適用）
    const investmentIncome = Math.round(prevYearInvestmentAssets * (parameters.investmentReturn / 100));

    // 収支計算（収入 - 支出）
    const totalIncome = mainIncome + sideIncome + spouseIncome + investmentIncome;
    const totalExpense = livingExpense + housingExpense + educationExpense + otherExpense;
    const personalBalance = totalIncome - totalExpense;
    
    const corporateBalance = corporateIncome + corporateOtherIncome - 
      (corporateExpense + corporateOtherExpense);

    // 今年の運用資産を計算
    const currentYearInvestmentAssets = prevYearInvestmentAssets + investmentAmount + investmentIncome;
    // 次の反復のために保存
    prevYearInvestmentAssets = currentYearInvestmentAssets;

    // キャッシュフローデータを更新
    newCashFlow[year] = {
      mainIncome,
      sideIncome,
      spouseIncome,
      investmentIncome,
      livingExpense,
      housingExpense,
      educationExpense,
      otherExpense,
      personalAssets: prevPersonalAssets,
      investmentAmount, // 追加: 投資に回した金額
      totalInvestmentAssets: currentYearInvestmentAssets, // 追加: 運用資産合計
      personalBalance,
      personalTotalAssets: prevPersonalAssets + personalBalance,
      corporateIncome,
      corporateOtherIncome,
      corporateExpense,
      corporateOtherExpense,
      corporateBalance,
      corporateTotalAssets: prevCorporateAssets + corporateBalance,
    };
  });

  set({ cashFlow: newCashFlow });
},

  initializeFormData: () => {
  const state = get();
  const { basicInfo, parameters } = state;
  const yearsUntilDeath = basicInfo.deathAge - basicInfo.currentAge;
  const years = Array.from(
    { length: yearsUntilDeath + 1 },
    (_, i) => basicInfo.startYear + i
  );

  // 収入データの初期化
  const newIncomeData = { 
    personal: [
      { 
        id: '1', 
        name: '給与収入', 
        type: 'income', 
        amounts: {}, 
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      },
      { 
        id: '2', 
        name: '事業収入', 
        type: 'profit', 
        amounts: {}, 
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      },
      { 
        id: '3', 
        name: '副業収入', 
        type: 'side', 
        amounts: {}, 
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      },
    ],
    corporate: [
      { 
        id: '1', 
        name: '売上', 
        type: 'income', 
        amounts: {}, 
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      },
      { 
        id: '2', 
        name: 'その他収入', 
        type: 'income', 
        amounts: {}, 
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      },
    ],
  };

  years.forEach(year => {
    // 配偶者の収入がある場合は追加
    if (basicInfo.maritalStatus !== 'single' && basicInfo.spouseInfo?.occupation) {
      const spouseIncomeItem = newIncomeData.personal.find(item => item.name === '配偶者収入') || {
        id: String(newIncomeData.personal.length + 1),
        name: '配偶者収入',
        type: 'income',
        amounts: {},
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      };

      if (!newIncomeData.personal.find(item => item.name === '配偶者収入')) {
        newIncomeData.personal.push(spouseIncomeItem);
      }
    }
  });

  // 支出データの初期化
  const newExpenseData = { ...state.expenseData };
  years.forEach(year => {
    // 生活費設定
    const livingExpenseItem = newExpenseData.personal.find(item => item.name === '生活費');
    if (livingExpenseItem) {
      livingExpenseItem.amounts[year] = basicInfo.monthlyLivingExpense * 12;
    }

    // 住居費設定
    const housingExpenseItem = newExpenseData.personal.find(item => item.name === '住居費');
    if (housingExpenseItem) {
      housingExpenseItem.amounts[year] = calculateHousingExpense(basicInfo.housingInfo, year);
    }

    // 教育費設定
    const educationExpenseItem = newExpenseData.personal.find(item => item.name === '教育費');
    if (educationExpenseItem) {
      educationExpenseItem.amounts[year] = calculateEducationExpense(
        basicInfo.children,
        basicInfo.plannedChildren,
        year,
        basicInfo.currentAge,
        basicInfo.startYear,
        state.parameters.educationCostIncreaseRate
      );
    }
  });

  // 資産データの初期化
  const newAssetData = { ...state.assetData };
  if (basicInfo.housingInfo.type === 'own' && basicInfo.housingInfo.own) {
    const realEstateItem = newAssetData.personal.find(item => item.name === '不動産');
    if (realEstateItem) {
      realEstateItem.amounts[basicInfo.housingInfo.own.purchaseYear] = 
        basicInfo.housingInfo.own.purchasePrice;
    }
  }

  // 負債データの初期化
  const newLiabilityData = { ...state.liabilityData };
  if (basicInfo.housingInfo.type === 'own' && basicInfo.housingInfo.own) {
    const loanItem = newLiabilityData.personal.find(item => item.name === 'ローン');
    if (loanItem) {
      loanItem.amounts[basicInfo.housingInfo.own.purchaseYear] = 
        basicInfo.housingInfo.own.loanAmount;
    }
  }

  set({
    incomeData: newIncomeData,
    expenseData: newExpenseData,
    assetData: newAssetData,
    liabilityData: newLiabilityData,
  });
},

  initializeCashFlow: () => {
    get().syncCashFlowFromFormData();
  },

  // Form data actions
  setIncomeData: (data) => {
    set({ incomeData: data });
    get().initializeCashFlow();
  },
  
  setExpenseData: (data) => {
    set({ expenseData: data });
    get().initializeCashFlow();
  },
  
  setAssetData: (data) => {
    set({ assetData: data });
    get().initializeCashFlow();
  },
  
  setLiabilityData: (data) => {
    set({ liabilityData: data });
    get().initializeCashFlow();
  },

  // History actions
  addHistoryEntry: (entry) => {
    set((state) => ({
      history: [
        ...state.history,
        {
          ...entry,
          timestamp: Date.now(),
        },
      ],
    }));
  },
  
  clearHistory: () => set({ history: [] }),
}));

function calculateEducationExpense(
  children: BasicInfo['children'],
  plannedChildren: BasicInfo['plannedChildren'],
  year: number,
  currentAge: number,
  startYear: number,
  educationCostIncreaseRate: number
): number {
  // Calculate expenses for existing children
  const existingChildrenExpense = children.reduce((total, child) => {
    const childAge = child.currentAge + (year - startYear);
    let expense = 0;

    const costs = {
      nursery: child.educationPlan.nursery === '私立' ? 50 : 23.3,
      preschool: child.educationPlan.preschool === '私立' ? 100 : 58.3,
      elementary: child.educationPlan.elementary === '私立' ? 83.3 : 41.7,
      juniorHigh: child.educationPlan.juniorHigh === '私立' ? 133.3 : 66.7,
      highSchool: child.educationPlan.highSchool === '私立' ? 250 : 83.3,
    };

    if (childAge >= 0 && childAge <= 2) expense = child.educationPlan.nursery !== '行かない' ? costs.nursery : 0;
    if (childAge >= 3 && childAge <= 5) expense = child.educationPlan.preschool !== '行かない' ? costs.preschool : 0;
    if (childAge >= 6 && childAge <= 11) expense = child.educationPlan.elementary !== '行かない' ? costs.elementary : 0;
    if (childAge >= 12 && childAge <= 14) expense = child.educationPlan.juniorHigh !== '行かない' ? costs.juniorHigh : 0;
    if (childAge >= 15 && childAge <= 17) expense = child.educationPlan.highSchool !== '行かない' ? costs.highSchool : 0;
    if (childAge >= 18 && childAge <= 21) expense = child.educationPlan.university !== '行かない' ? getUniversityCost(child.educationPlan.university) : 0;

    const yearsSinceStart = year - startYear;
    const increaseMultiplier = Math.pow(1 + educationCostIncreaseRate / 100, yearsSinceStart);
    return total + (expense * increaseMultiplier);
  }, 0);

  // Calculate expenses for planned children
  const plannedChildrenExpense = plannedChildren.reduce((total, child) => {
    const yearsSinceStart = year - startYear;
    if (yearsSinceStart >= child.yearsFromNow) {
      const childAge = yearsSinceStart - child.yearsFromNow;
      let expense = 0;

      const costs = {
        nursery: child.educationPlan.nursery === '私立' ? 50 : 23.3,
        preschool: child.educationPlan.preschool === '私立' ? 100 : 58.3,
        elementary: child.educationPlan.elementary === '私立' ? 83.3 : 41.7,
        juniorHigh: child.educationPlan.juniorHigh === '私立' ? 133.3 : 66.7,
        highSchool: child.educationPlan.highSchool === '私立' ? 250 : 83.3,
      };

      if (childAge >= 0 && childAge <= 2) expense = child.educationPlan.nursery !== '行かない' ? costs.nursery : 0;
      if (childAge >= 3 && childAge <= 5) expense = child.educationPlan.preschool !== '行かない' ? costs.preschool : 0;
      if (childAge >= 6 && childAge <= 11) expense = child.educationPlan.elementary !== '行かない' ? costs.elementary : 0;
      if (childAge >= 12 && childAge <= 14) expense = child.educationPlan.juniorHigh !== '行かない' ? costs.juniorHigh : 0;
      if (childAge >= 15 && childAge <= 17) expense = child.educationPlan.highSchool !== '行かない' ? costs.highSchool : 0;
      if (childAge >= 18 && childAge <= 21) expense = child.educationPlan.university !== '行かない' ? getUniversityCost(child.educationPlan.university) : 0;

      const increaseMultiplier = Math.pow(1 + educationCostIncreaseRate / 100, yearsSinceStart);
      return total + (expense * increaseMultiplier);
    }
    return total;
  }, 0);

  return Number((existingChildrenExpense + plannedChildrenExpense).toFixed(1));
}

function getUniversityCost(universityType: string): number {
  switch (universityType) {
    case '公立大学（文系）':
      return 325;
    case '公立大学（理系）':
      return 375;
    case '私立大学（文系）':
      return 550;
    case '私立大学（理系）':
      return 650;
    default:
      return 0;
  }
}