"use client";

import { useState } from "react";
import { AlertTriangle, Lightbulb, TrendingUp, Copy, Check, Search, Loader2, Download } from "lucide-react";

export default function ReviewMinerDashboard() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    setErrorMsg(null);
    setReport(null);
    
    try {
      // الاتصال بالخادم الحي على Render
      const response = await fetch("https://kian-review-api.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error("محرك الذكاء الاصطناعي يشهد ضغطاً عالياً حالياً. يرجى الانتظار بضع ثوانٍ ثم الضغط على 'تحليل الآن' مرة أخرى.");
      }

      const data = await response.json();
      
      if (data.marketResearchReport) {
        setReport(data.marketResearchReport);
      } else {
        throw new Error("لم يتم العثور على التقرير. يرجى المحاولة مرة أخرى.");
      }
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // دالة تصدير التقرير إلى PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      
      // تحقق برمجي كلاسيكي بدلاً من استخدام (as HTMLElement) لتجنب أخطاء البناء في Vercel
      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد تصديره");
      }
      
      const opt: any = {
        margin: 10,
        filename: 'Kian_Market_Research_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("حدث خطأ أثناء تصدير الملف.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* رأس الصفحة - مركز القيادة */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">مُحلل المنافسين الذكي 🚀</h1>
            <p className="text-gray-500">استخرج نقاط ضعف منافسيك وحولها إلى خطافات إعلانية عالية التحويل في ثوانٍ.</p>
          </div>
          
          <div className="flex max-w-2xl mx-auto gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="url"
                placeholder="أدخل رابط منتج المنافس (مثال: https://quotes.toscrape.com/)..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-left"
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !url}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تحليل الآن"}
            </button>
          </div>
          {errorMsg && (
            <div className="text-red-500 text-sm font-medium mt-2 bg-red-50 p-3 rounded-lg inline-block">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* منطقة عرض النتائج */}
        {report && report.top_3_structural_flaws && (
          <div className="space-y-6">
            {/* شريط الإجراءات (زر التصدير) */}
            <div className="flex justify-end">
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "جاري التصدير..." : "تحميل التقرير PDF"}
              </button>
            </div>

            {/* الحاوية التي سيتم تحويلها لـ PDF */}
            <div id="report-content" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-2">
              
              <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-red-700">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">أبرز 3 عيوب في المنافس</h2>
                </div>
                <ul className="space-y-3" dir="ltr">
                  {report.top_3_structural_flaws.map((flaw: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed text-left">
                      <span className="text-red-500 font-bold">•</span>
                      {flaw}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">رغبات السوق غير الملباة</h2>
                </div>
                <ul className="space-y-3" dir="ltr">
                  {report.unmet_desires.map((desire: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700 leading-relaxed text-left">
                      <span className="text-blue-500 font-bold">•</span>
                      {desire}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-gray-900 border-b pb-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">خطافات تيك توك وميتا الجاهزة</h2>
                    <p className="text-sm text-gray-500 mt-1">انسخ النصوص وأرسلها لفريق الميديا باير الخاص بك</p>
                  </div>
                </div>
                
                <div className="grid gap-4" dir="ltr">
                  {report.tiktok_meta_ad_hooks.map((hook: string, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group text-left">
                      <p className="text-gray-800 font-medium leading-relaxed">{hook}</p>
                      <button
                        onClick={() => copyToClipboard(hook, index)}
                        className={`p-2 rounded-lg flex-shrink-0 transition-all ${
                          copiedIndex === index ? "bg-green-100 text-green-600" : "bg-white text-gray-400 hover:text-gray-900 border shadow-sm group-hover:border-gray-300"
                        }`}
                        data-html2canvas-ignore // يمنع ظهور زر النسخ في ملف الـ PDF
                      >
                        {copiedIndex === index ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}