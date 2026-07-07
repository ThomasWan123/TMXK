export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
      <p>Dreamweaver 不提供医学或心理治疗建议，内容仅供自我探索与娱乐参考。</p>
      <p className="mt-2">© {new Date().getFullYear()} Dreamweaver</p>
      <p className="mt-2">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300"
        >
          沪ICP备2026030458号-1
        </a>
      </p>
    </footer>
  );
}
