import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';
import {
  calculatePercentages,
  calculateLoanEMI,
  calculateDateDifference,
  calculateDiscount,
  calculateVatTax,
  calculateAverageStats,
  evaluateBasicExpression,
} from '../../utils/toolLogic';

interface CalculatorToolRunnerProps {
  tool: ToolDefinition;
}

export function CalculatorToolRunner({ tool }: CalculatorToolRunnerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Percentage Calculator state
  const [pctX, setPctX] = useState<number>(25);
  const [pctY, setPctY] = useState<number>(240);

  // 2. Basic Calculator state
  const [exprInput, setExprInput] = useState<string>('1250 * 1.15 - 180');
  const [calcTape, setCalcTape] = useState<Array<{ expr: string; result: number }>>([
    { expr: '450 + 320', result: 770 },
    { expr: '1250 * 1.15 - 180', result: 1257.5 },
  ]);

  // 3. Loan EMI Calculator state
  const [loanPrincipal, setLoanPrincipal] = useState<number>(250000);
  const [loanRate, setLoanRate] = useState<number>(5.75);
  const [loanMonths, setLoanMonths] = useState<number>(240);

  // 4. Date Difference state
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-10-18');
  const [includeEnd, setIncludeEnd] = useState<boolean>(false);

  // 5. Discount & VAT state
  const [pricingTab, setPricingTab] = useState<'discount' | 'vat'>('discount');
  const [origPrice, setOrigPrice] = useState<number>(180);
  const [discPct1, setDiscPct1] = useState<number>(20);
  const [discPct2, setDiscPct2] = useState<number>(10);
  const [salesTaxPct, setSalesTaxPct] = useState<number>(8);
  const [vatAmountInput, setVatAmountInput] = useState<number>(500);
  const [vatRateInput, setVatRateInput] = useState<number>(20);
  const [vatMode, setVatMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  // 6. Average & Statistics state
  const [statsInput, setStatsInput] = useState<string>('14, 28, 35, 42, 56, 70, 98');

  const handleCopy = (id: string, value: string | number) => {
    navigator.clipboard.writeText(String(value));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ==========================================
  // 1. PERCENTAGE CALCULATOR
  // ==========================================
  if (tool.id === 'percentage-calculator') {
    const res = calculatePercentages(pctX, pctY);
    const cards = [
      {
        id: 'pct-of',
        title: `What is ${pctX}% of ${pctY}?`,
        formula: `(${pctX} ÷ 100) × ${pctY}`,
        value: res.percentOfValue,
        suffix: '',
      },
      {
        id: 'is-what-pct',
        title: `${pctX} is what percent of ${pctY}?`,
        formula: `(${pctX} ÷ ${pctY}) × 100`,
        value: res.isWhatPercent,
        suffix: '%',
      },
      {
        id: 'pct-change',
        title: `Percentage change from ${pctX} to ${pctY}`,
        formula: `((${pctY} - ${pctX}) ÷ |${pctX}|) × 100`,
        value: res.percentChange,
        suffix: '%',
      },
      {
        id: 'pct-diff',
        title: `Percentage difference between ${pctX} & ${pctY}`,
        formula: `|${pctX} - ${pctY}| ÷ ((${pctX} + ${pctY}) / 2) × 100`,
        value: res.percentDifference,
        suffix: '%',
      },
    ];

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div>
            <label htmlFor="pct-x-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Value X (Percentage or Starting Value)
            </label>
            <input
              id="pct-x-input"
              type="number"
              step="any"
              value={pctX}
              onChange={(e) => setPctX(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-base font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg focus:outline-2 focus:outline-[#4F46E5]"
            />
          </div>
          <div>
            <label htmlFor="pct-y-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Value Y (Base or Ending Value)
            </label>
            <input
              id="pct-y-input"
              type="number"
              step="any"
              value={pctY}
              onChange={(e) => setPctY(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-base font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg focus:outline-2 focus:outline-[#4F46E5]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-5 rounded-xl border border-[#E2E8F0] bg-white flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-medium text-[#64748B]">{card.title}</p>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
                    {card.value}
                    {card.suffix}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(card.id, `${card.value}${card.suffix}`)}
                    aria-label={`Copy result for ${card.title}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-md transition-colors"
                  >
                    {copiedId === card.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="text-[#059669]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/60 text-[11px] font-mono text-[#64748B]">
                Formula: {card.formula}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. BASIC & EXPRESSION CALCULATOR
  // ==========================================
  if (tool.id === 'basic-calculator') {
    const evalRes = evaluateBasicExpression(exprInput);
    const keypad = [
      ['(', ')', '%', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', 'C', '='],
    ];

    const handleKeyClick = (key: string) => {
      if (key === 'C') {
        setExprInput('');
      } else if (key === '=') {
        if (evalRes.result !== null) {
          setCalcTape((prev) => [{ expr: exprInput, result: evalRes.result! }, ...prev.slice(0, 9)]);
          setExprInput(String(evalRes.result));
        }
      } else {
        setExprInput((prev) => prev + key);
      }
    };

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <label htmlFor="calc-expr-input" className="block text-xs font-medium text-[#64748B] mb-1">
              Expression Input
            </label>
            <input
              id="calc-expr-input"
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && evalRes.result !== null) {
                  e.preventDefault();
                  setCalcTape((prev) => [
                    { expr: exprInput, result: evalRes.result! },
                    ...prev.slice(0, 9),
                  ]);
                }
              }}
              placeholder="e.g. (250 + 75) * 1.2"
              className="w-full text-xl font-mono tabular-nums text-[#0F172A] bg-transparent focus:outline-none"
            />
            <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">Live Result</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#4F46E5]">
                {evalRes.result !== null ? `= ${evalRes.result}` : evalRes.error}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {keypad.flat().map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyClick(key)}
                className={`py-3 text-base font-semibold font-mono rounded-xl border transition-colors ${
                  key === '='
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5] hover:bg-[#4338CA]'
                    : key === 'C'
                    ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 hover:bg-[#DC2626]/15'
                    : ['÷', '×', '-', '+', '(', ')', '%'].includes(key)
                    ? 'bg-[#F8FAFC] text-[#4F46E5] border-[#E2E8F0] hover:bg-[#E2E8F0]/50'
                    : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#0F172A]">Session Calculation Tape</h3>
              <button
                type="button"
                onClick={() => setCalcTape([])}
                className="text-xs text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            {calcTape.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6 text-center">
                Press "=" or Enter to save calculations to the tape.
              </p>
            ) : (
              <ul className="space-y-2">
                {calcTape.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs font-mono tabular-nums"
                  >
                    <button
                      type="button"
                      onClick={() => setExprInput(item.expr)}
                      className="text-left truncate text-[#64748B] hover:text-[#0F172A]"
                    >
                      {item.expr} = <strong className="text-[#0F172A]">{item.result}</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(`tape-${idx}`, item.result)}
                      aria-label={`Copy ${item.result}`}
                      className="text-[#4F46E5] shrink-0"
                    >
                      {copiedId === `tape-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. LOAN & MORTGAGE EMI CALCULATOR
  // ==========================================
  if (tool.id === 'loan-emi-calculator') {
    const loan = calculateLoanEMI(loanPrincipal, loanRate, loanMonths);

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div>
            <label htmlFor="loan-principal" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Loan Principal Amount
            </label>
            <input
              id="loan-principal"
              type="number"
              min={100}
              step={1000}
              value={loanPrincipal}
              onChange={(e) => setLoanPrincipal(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="loan-rate" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Annual Interest Rate (%)
            </label>
            <input
              id="loan-rate"
              type="number"
              min={0}
              max={50}
              step={0.1}
              value={loanRate}
              onChange={(e) => setLoanRate(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="loan-months" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Loan Term (Months · {(loanMonths / 12).toFixed(1)} yrs)
            </label>
            <input
              id="loan-months"
              type="number"
              min={1}
              max={480}
              value={loanMonths}
              onChange={(e) => setLoanMonths(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-[#4F46E5]/30 bg-[#4F46E5]/5">
            <span className="text-xs font-medium text-[#64748B]">Monthly Payment (EMI)</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#4F46E5] mt-1">
              {loan.monthlyPayment.toLocaleString()}
            </div>
          </div>
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
            <span className="text-xs font-medium text-[#64748B]">Total Interest Payable</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
              {loan.totalInterest.toLocaleString()} ({loan.interestRatio}%)
            </div>
          </div>
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
            <span className="text-xs font-medium text-[#64748B]">Total Payment (Principal + Interest)</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
              {loan.totalPayment.toLocaleString()}
            </div>
          </div>
        </div>

        {loan.schedulePreview.length > 0 && (
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#0F172A]">
              First 12 Months Amortization Schedule
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono tabular-nums">
                <thead className="bg-white border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="py-2.5 px-4">Month</th>
                    <th className="py-2.5 px-4 text-right">Payment</th>
                    <th className="py-2.5 px-4 text-right">Principal</th>
                    <th className="py-2.5 px-4 text-right">Interest</th>
                    <th className="py-2.5 px-4 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {loan.schedulePreview.map((row) => (
                    <tr key={row.month} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-4 font-semibold text-[#0F172A]">#{row.month}</td>
                      <td className="py-2 px-4 text-right">{row.payment.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-[#059669]">
                        {row.principal.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-right text-[#64748B]">
                        {row.interest.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-[#0F172A]">
                        {row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 4. DATE DIFFERENCE & WORKING DAYS
  // ==========================================
  if (tool.id === 'date-difference-calculator') {
    const diff = calculateDateDifference(startDate, endDate, includeEnd);

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] items-end">
          <div>
            <label htmlFor="start-date" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div className="pb-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={includeEnd}
                onChange={(e) => setIncludeEnd(e.target.checked)}
                className="w-4 h-4 accent-[#4F46E5] rounded"
              />
              <span>Include end date (+1 day)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#4F46E5]/30 bg-[#4F46E5]/5">
            <span className="text-xs text-[#64748B]">Calendar Span</span>
            <div className="text-lg font-bold font-mono tabular-nums text-[#4F46E5] mt-1">
              {diff.years}y {diff.months}m {diff.days}d
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
            <span className="text-xs text-[#64748B]">Total Calendar Days</span>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0F172A] mt-1">
              {diff.totalDays.toLocaleString()} days
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
            <span className="text-xs text-[#64748B]">Working Days (Mon–Fri)</span>
            <div className="text-lg font-bold font-mono tabular-nums text-[#059669] mt-1">
              {diff.workingDays.toLocaleString()} days
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
            <span className="text-xs text-[#64748B]">Weeks + Remainder</span>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0F172A] mt-1">
              {diff.totalWeeks}w {diff.remainingDaysAfterWeeks}d
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. DISCOUNT & VAT CALCULATOR
  // ==========================================
  if (tool.id === 'discount-vat-calculator') {
    const discRes = calculateDiscount(origPrice, discPct1, discPct2, salesTaxPct);
    const vatRes = calculateVatTax(vatAmountInput, vatRateInput, vatMode);

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="inline-flex p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <button
            type="button"
            onClick={() => setPricingTab('discount')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              pricingTab === 'discount' ? 'bg-white text-[#0F172A] shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            Sale Discount Calculator
          </button>
          <button
            type="button"
            onClick={() => setPricingTab('vat')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              pricingTab === 'vat' ? 'bg-white text-[#0F172A] shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            VAT / Sales Tax Calculator
          </button>
        </div>

        {pricingTab === 'discount' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Original Price
                </label>
                <input
                  type="number"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(Number(e.target.value))}
                  aria-label="Original Price"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Primary Discount (%)
                </label>
                <input
                  type="number"
                  value={discPct1}
                  onChange={(e) => setDiscPct1(Number(e.target.value))}
                  aria-label="Primary Discount Percent"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Extra Stacked Discount (%)
                </label>
                <input
                  type="number"
                  value={discPct2}
                  onChange={(e) => setDiscPct2(Number(e.target.value))}
                  aria-label="Extra Stacked Discount Percent"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Sales Tax (%)
                </label>
                <input
                  type="number"
                  value={salesTaxPct}
                  onChange={(e) => setSalesTaxPct(Number(e.target.value))}
                  aria-label="Sales Tax Percent"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-[#059669]/30 bg-[#059669]/5">
                <span className="text-xs text-[#64748B]">Final Payable Price</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#059669] mt-1">
                  {discRes.finalPrice.toFixed(2)}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-xs text-[#64748B]">Total Amount Saved</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                  {discRes.amountSaved.toFixed(2)} ({discRes.effectiveDiscountPercent}% off)
                </div>
              </div>
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-xs text-[#64748B]">Included Tax Amount</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                  {discRes.taxAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Amount</label>
                <input
                  type="number"
                  value={vatAmountInput}
                  onChange={(e) => setVatAmountInput(Number(e.target.value))}
                  aria-label="VAT Input Amount"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  VAT / Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={vatRateInput}
                  onChange={(e) => setVatRateInput(Number(e.target.value))}
                  aria-label="VAT Rate Percent"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Calculation Mode
                </label>
                <select
                  value={vatMode}
                  onChange={(e) => setVatMode(e.target.value as 'exclusive' | 'inclusive')}
                  aria-label="VAT Calculation Mode"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                >
                  <option value="exclusive">Add Tax (Net → Gross)</option>
                  <option value="inclusive">Extract Tax (Gross → Net)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-xs text-[#64748B]">Net Amount (Excl. Tax)</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                  {vatRes.netAmount.toFixed(2)}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-xs text-[#64748B]">VAT / Tax Portion</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#4F46E5] mt-1">
                  {vatRes.vatAmount.toFixed(2)}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-xs text-[#64748B]">Gross Total (Incl. Tax)</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#059669] mt-1">
                  {vatRes.grossAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // 6. AVERAGE, MEDIAN & RANGE CALCULATOR
  // ==========================================
  const parsedNums = statsInput
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const stats = calculateAverageStats(parsedNums);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
      <div>
        <label htmlFor="stats-numbers-input" className="block text-xs font-semibold text-[#0F172A] mb-2">
          Enter Numbers (separated by commas, spaces, or line breaks)
        </label>
        <textarea
          id="stats-numbers-input"
          rows={4}
          value={statsInput}
          onChange={(e) => setStatsInput(e.target.value)}
          className="w-full p-3.5 text-sm font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-2 focus:outline-[#4F46E5]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Mean Average', value: stats.mean },
          { label: 'Median', value: stats.median },
          { label: 'Sum Total', value: stats.sum },
          { label: 'Count', value: stats.count },
          { label: 'Minimum', value: stats.min },
          { label: 'Maximum', value: stats.max },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <span className="text-xs text-[#64748B]">{item.label}</span>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0F172A] mt-1">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
