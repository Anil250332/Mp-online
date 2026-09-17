import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function AgentTerms() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <span>Citizen Center Online - Terms, Conditions & Security Policies</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard operating guidelines for authorized MP Online & Retailer Kiosk Centers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>1. Kiosk Operator Guidelines</span>
            </h2>
            <p className="text-slate-600">
              All registered Kiosk Agents and Retailers must strictly comply with official MP Online and e-Governance service guidelines. Charging fees above official prescribed rates is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>2. Wallet & Service Fee Deductions</span>
            </h2>
            <p className="text-slate-600">
              Service fees are automatically deducted from the shop wallet upon submitting applications. Wallet recharges via UPI or Net Banking are instant and non-refundable once credited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>3. Data Privacy & Customer Document Confidentiality</span>
            </h2>
            <p className="text-slate-600">
              Customer Aadhaar, PAN, Samagra ID, and personal document data must be kept completely confidential and used solely for authorized portal applications.
            </p>
          </section>
        </div>

      </div>
    </DashboardLayout>
  );
}
