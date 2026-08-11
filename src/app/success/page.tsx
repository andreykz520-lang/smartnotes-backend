import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white relative flex flex-col justify-center items-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/20 blur-[100px] rounded-[100%] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.1)] relative z-10 backdrop-blur-xl text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Оплата прошла успешно!</h1>
        <p className="text-gray-300 mb-6">
          Спасибо за покупку PRO версии SmartNotes AI!
        </p>
        
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl mb-8">
          <p className="text-sm text-gray-200">
            Мы отправили <strong>код активации</strong> на ваш email. 
            Проверьте почту (и папку "Спам", если письма нет во Входящих).
          </p>
        </div>

        <Link 
          href="/" 
          className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
