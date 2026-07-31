import { PrintableReport } from "@/components/chat";

export const metadata = {
  title: "HOYA BIT AI 分析報告",
};

export default function ReportPage() {
  return (
    <div className="report-page min-h-screen bg-white">
      <PrintableReport />
    </div>
  );
}
