const rows = [
  ["S생명", "청구 서류", "최근 확인"],
  ["H손보", "고객 안내", "템플릿 준비"],
  ["K화재", "업무 링크", "검토 예정"]
];

export function ProductPreview() {
  return (
    <div className="w-full border border-[#efe4cf]/20 bg-[#fbf7ee] p-4 text-[#18202b] shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="border-b border-[#d9c9a8] pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#7a612d]">Today Desk</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#102235]">
              업무 시작 보드
            </h2>
          </div>
          <p className="bg-[#173f36] px-3 py-2 text-sm font-semibold text-[#fbf7ee]">
            Beta
          </p>
        </div>
      </div>

      <div className="grid gap-3 py-5 sm:grid-cols-3">
        {["보험사", "서류", "메시지"].map((item, index) => (
          <div key={item} className="border border-[#d9c9a8] bg-[#f7f1e5] p-4">
            <p className="text-3xl font-semibold text-[#102235]">{index + 8}</p>
            <p className="mt-1 text-sm font-medium text-[#4f5661]">{item}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.join("-")}
            className="grid grid-cols-[0.8fr_1fr_1fr] gap-3 border border-[#d9c9a8] bg-white px-4 py-3 text-sm"
          >
            <span className="font-semibold text-[#102235]">{row[0]}</span>
            <span className="text-[#4f5661]">{row[1]}</span>
            <span className="text-right text-[#7a612d]">{row[2]}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-[#102235] p-5 text-[#fbf7ee]">
        <p className="text-sm text-[#d8c08f]">Next action</p>
        <p className="mt-2 text-lg font-semibold">
          고객 안내 전, 청구 서류 기준과 메시지 톤을 함께 확인합니다.
        </p>
      </div>
    </div>
  );
}
