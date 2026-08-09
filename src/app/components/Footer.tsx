const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800/60 pb-8">
          <div className="flex items-center gap-3">
            <img 
              src="/app_icon.png" 
              alt="OBD2SCANAI App Icon" 
              className="w-9 h-9 rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20 object-cover"
            />
            <span className="font-bold text-white tracking-wider text-lg">OBD2SCANAI</span>
          </div>

          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Возможности</a>
            <a href="#screenshots" className="hover:text-cyan-400 transition-colors">Скриншоты</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Тарифы</a>
            <a href="/admin/management/codes" className="hover:text-amber-400 transition-colors">Админ-панель</a>
            <a href="mailto:support@obd2scanai.online" className="hover:text-cyan-400 transition-colors">Поддержка</a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-400">Самозанятый Чемарев Андрей Владимирович, ИНН: 540314274724</p>
          <p>Email поддержки: <a href="mailto:support@obd2scanai.online" className="text-cyan-400 hover:underline">support@obd2scanai.online</a></p>
          <p>© {new Date().getFullYear()} OBD2SCANAI. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

