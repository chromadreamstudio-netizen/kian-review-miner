"use client";

import { useState } from "react";
import { AlertTriangle, Lightbulb, TrendingUp, Copy, Check, Search, Loader2, Download, Users, DollarSign, Activity } from "lucide-react";

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
      const response = await fetch("https://kian-review-api.onrender.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء معالجة الرابط. يرجى المحاولة مرة أخرى.");
      }

      const data = await response.json();
      
      if (data.marketResearchReport) {
        setReport(data.marketResearchReport);
      } else {
        throw new Error("لم يتم العثور على التقرير في استجابة الخادم.");
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

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      
      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد تصديره");
      }
      
      const opt: any = {
        margin: [10, 10, 10, 10], // هوامش متساوية
        filename: 'Kian_Market_Research_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
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
        
        {/* Header */}
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
                placeholder="أدخل رابط المنتج..."
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

        {/* Report Content */}
        {report && (
          <div className="space-y-6">
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

            <div id="report-content" className="space-y-6 bg-gray-50 p-4 rounded-xl">
              
              {/* Header inside PDF */}
              <div className="text-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">تقرير استخبارات السوق</h2>
                <p className="text-gray-500 mt-1">تم الإنشاء بواسطة Kian Solutions</p>
              </div>

              {/* Metadata & Pricing Grid */}
              {report.report_metadata && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4">
                    <Activity className="h-8 w-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                    <div>
                      <h3 className="text-sm text-gray-500 font-medium">التحليل الإحصائي</h3>
                      <p className="font-bold text-gray-800">{report.report_metadata.analyzed_sample_size}</p>
                      <p className="text-sm text-gray-600">التوجه العام: {report.report_metadata.general_sentiment}</p>
                    </div>
                  </div>
                  {report.pricing_gap_analysis && (
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex gap-4">
                      <DollarSign className="h-8 w-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg shrink-0" />
                      <div>
                        <h3 className="text-sm text-gray-500 font-medium">تحليل الفجوة التسعيرية</h3>
                        <p className="font-medium text-gray-800 text-sm leading-relaxed">{report.pricing_gap_analysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Buyer Persona */}
              {report.buyer_persona && (
                <div className="bg-white border border-indigo-100 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 text-indigo-700 mb-4">
                    <Users className="h-6 w-6 bg-indigo-50 p-1 rounded-lg" />
                    <h2 className="text-xl font-bold">شخصية المشتري (Buyer Persona)</h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-indigo-50/50 p-4 rounded-xl">
                      <span className="block text-indigo-600 font-bold mb-1">التركيبة السكانية:</span>
                      <span className="text-gray-700">{report.buyer_persona.demographics}</span>
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-xl">
                      <span className="block text-indigo-600 font-bold mb-1">الرغبة العميقة:</span>
                      <span className="text-gray-700">{report.buyer_persona.core_desire}</span>
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <span className="block text-red-500 font-bold mb-1">أكبر نقطة ألم:</span>
                      <span className="text-gray-700">{report.buyer_persona.pain_points}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flaws & Desires Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.top_3_structural_flaws && (
                  <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 text-red-700 mb-4">
                      <AlertTriangle className="h-6 w-6 bg-red-100 p-1 rounded-lg" />
                      <h2 className="text-lg font-bold">أبرز العيوب الهيكلية</h2>
                    </div>
                    <ul className="space-y-3">
                      {report.top_3_structural_flaws.map((flaw: string, i: number) => (
                        <li key={i} className="flex gap-2 text-gray-700 text-sm leading-relaxed">
                          <span className="text-red-500 font-bold">•</span> {flaw}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.unmet_desires && (
                  <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 text-blue-700 mb-4">
                      <Lightbulb className="h-6 w-6 bg-blue-100 p-1 rounded-lg" />
                      <h2 className="text-lg font-bold">الرغبات غير الملباة</h2>
                    </div>
                    <ul className="space-y-3">
                      {report.unmet_desires.map((desire: string, i: number) => (
                        <li key={i} className="flex gap-2 text-gray-700 text-sm leading-relaxed">
                          <span className="text-blue-500 font-bold">•</span> {desire}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Ad Hooks */}
              {report.tiktok_meta_ad_hooks && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 text-gray-900 border-b pb-4 mb-4">
                    <TrendingUp className="h-6 w-6 bg-gray-100 p-1 rounded-lg" />
                    <div>
                      <h2 className="text-xl font-bold">زوايا إعلانية مقترحة (Ad Hooks)</h2>
                      <p className="text-xs text-gray-500 mt-1">جاهزة للاستخدام في تيك توك وميتا</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {report.tiktok_meta_ad_hooks.map((hook: string, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group">
                        <p className="text-gray-800 text-sm font-medium leading-relaxed">{hook}</p>
                        <button
                          onClick={() => copyToClipboard(hook, index)}
                          className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${
                            copiedIndex === index ? "text-green-600" : "text-gray-400 hover:text-gray-900"
                          }`}
                          data-html2canvas-ignore
                        >
                          {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}