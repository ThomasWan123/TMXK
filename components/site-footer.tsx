export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
      <p>Dreamweaver 不提供医学或心理治疗建议，内容仅供自我探索与娱乐参考。</p>
      <p className="mt-2">© {new Date().getFullYear()} Dreamweaver</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300"
        >
          沪ICP备2026030458号-1
        </a>
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=31010602010299"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-slate-300"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/beian/gongan.png"
            alt="公安备案"
            width={16}
            height={16}
            className="h-4 w-4"
          />
          沪公网安备31010602010299号
        </a>
      </div>
    </footer>
  );
}
