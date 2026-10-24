"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const guideI18n: Record<string, {
  backHome: string;
  printPdf: string;
  openWebApp: string;
  badge: string;
  title: string;
  subtitle: string;
  savePdfBtn: string;
  launchAppBtn: string;
  sec1Title: string;
  sec1Desc: string;
  addToHomeTitle: string;
  androidTitle: string;
  androidStep1: string;
  androidStep2: string;
  androidStep3: string;
  iosTitle: string;
  iosStep1: string;
  iosStep1Suffix: string;
  iosStep2: string;
  iosStep3: string;
  pcTitle: string;
  pcStep1: string;
  pcStep2: string;
  pcStep3: string;
  auroraTitle: string;
  auroraDesc: string;
  auroraPkg64: string;
  auroraPkg32: string;
  sec2Title: string;
  sec2Desc: string;
  sec3Title: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  printGuideBtn: string;
}> = {
  ru: {
    backHome: "← На главную",
    printPdf: "📄 Скачать PDF / Печать",
    openWebApp: "🌐 Открыть веб-блокнот",
    badge: "📖 Официальное руководство пользователя",
    title: "Руководство пользователя SmartNotes AI",
    subtitle: "Умный блокнот и электронная записная книжка с искусственным интеллектом на 6 языках. Всё о веб-версии, диктовке голосом, ИИ-помощнике и защите заметок.",
    savePdfBtn: "📥 Сохранить инструкцию в PDF",
    launchAppBtn: "🚀 Перейти в блокнот онлайн",
    sec1Title: "1. Как пользоваться универсальной веб-версией",
    sec1Desc: "Веб-версия SmartNotes AI — это полноценное PWA-приложение (Progressive Web App). Ей не нужны магазины приложений: она работает мгновенно в браузере любого устройства — Android, iPhone, Windows, Mac, Linux и ОС «Аврора». Она не забивает память телефона и всегда обновлена до последней версии.",
    addToHomeTitle: "📱 Как вынести иконку блокнота на рабочий стол (в 1 клик):",
    androidTitle: "🤖 Android (Chrome / Яндекс)",
    androidStep1: "Откройте",
    androidStep2: "Нажмите три точки ⋮ в правом верхнем углу",
    androidStep3: "Выберите «Установить приложение» или «Добавить на главный экран»",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "Откройте",
    iosStep1Suffix: "в Safari",
    iosStep2: "Нажмите кнопку «Поделиться» (квадрат со стрелкой ⎋)",
    iosStep3: "Прокрутите вниз и выберите «На экран «Домой»",
    pcTitle: "💻 ПК / Ноутбук / Desktop",
    pcStep1: "Откройте сайт в Chrome / Edge / Яндекс",
    pcStep2: "В адресной строке справа нажмите значок ⊕ («Установить»)",
    pcStep3: "Иконка появится на рабочем столе как отдельная программа!",
    auroraTitle: "🛡️ ОС Аврора (RPM)",
    auroraDesc: "Нативные пакеты для устройств с ОС Аврора:",
    auroraPkg64: "Пакет 64-бит (.rpm)",
    auroraPkg32: "Пакет 32-бит (.rpm)",
    sec2Title: "2. Поддержка 6 языков интерфейса и распознавания",
    sec2Desc: "SmartNotes AI полностью адаптирован для пользователей со всего мира. Доступны: Русский (RU), Английский (EN), Испанский (ES), Французский (FR), Немецкий (DE) и Арабский (AR). Переключение языка доступно в один клик в правом верхнем углу меню.",
    sec3Title: "3. Как пользоваться ключевыми функциями",
    feat1Title: "🎙️ Голосовой ввод на лету (Speech-to-Text)",
    feat1Desc: "Нажмите на значок микрофона внутри любой заметки и говорите. Приложение мгновенно переводит речь в текст, расставляет знаки препинания и делит мысли по абзацам. Идеально для записи идей за рулём или на ходу.",
    feat2Title: "✨ Умный анализ и ИИ-помощник (Gemini 3.8)",
    feat2Desc: "Вставьте длинную статью, конспект лекции или протокол совещания и нажмите «Суммаризовать с ИИ». Нейросеть за 2 секунды выделит самое главное, составит список задач и план действий.",
    feat3Title: "🔒 Секретные заметки под PIN-кодом",
    feat3Desc: "Личные мысли, пароли или конфиденциальные планы можно скрыть под 4-значным PIN-кодом. Содержимое таких записей надёжно зашифровано и не отображается в общем списке без ввода кода.",
    feat4Title: "💬 ИИ-Чат и распознавание объектов по фото",
    feat4Desc: "Прикрепите фотографию часов, прибора, рецепта или документа в чат с ассистентом. ИИ определит модель, переведёт текст с картинки или найдёт похожие товары.",
    feat5Title: "☁️ Облачная синхронизация между устройствами",
    feat5Desc: "Начните писать заметку на телефоне в метро — и продолжите её редактировать на компьютере дома. Синхронизация до 3-х устройств гарантирует, что вы никогда не потеряете важные записи.",
    printGuideBtn: "📄 Распечатать памятку"
  },
  en: {
    backHome: "← Back to Home",
    printPdf: "📄 Print / Save PDF",
    openWebApp: "🌐 Open Web Notepad",
    badge: "📖 Official User Guide",
    title: "SmartNotes AI User Guide",
    subtitle: "Smart multilingual AI notebook and notepad in 6 languages. Complete guide to the universal web version, voice dictation, Gemini AI, and privacy features.",
    savePdfBtn: "📥 Save Guide as PDF",
    launchAppBtn: "🚀 Launch Online Notepad",
    sec1Title: "1. How to Use the Universal Web App",
    sec1Desc: "SmartNotes AI web version is a full Progressive Web App (PWA). No app store download required: it runs seamlessly on Android, iOS, Windows, Mac, Linux, and Aurora OS, saving device storage and staying automatically updated.",
    addToHomeTitle: "📱 Add App Icon to Home Screen (1 Click):",
    androidTitle: "🤖 Android (Chrome / Brave)",
    androidStep1: "Open",
    androidStep2: "Tap the three dots ⋮ in the upper right corner",
    androidStep3: "Select \"Install app\" or \"Add to Home screen\"",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "Open",
    iosStep1Suffix: "in Safari",
    iosStep2: "Tap the \"Share\" button (square with arrow ⎋)",
    iosStep3: "Scroll down and tap \"Add to Home Screen\"",
    pcTitle: "💻 PC / Laptop / Desktop",
    pcStep1: "Open the website in Chrome / Edge / Brave",
    pcStep2: "Click the ⊕ (\"Install\") icon on the right side of address bar",
    pcStep3: "The app icon will appear on your desktop as a standalone program!",
    auroraTitle: "🛡️ Aurora OS (RPM)",
    auroraDesc: "Native RPM packages for Aurora OS devices:",
    auroraPkg64: "64-bit package (.rpm)",
    auroraPkg32: "32-bit package (.rpm)",
    sec2Title: "2. 6 Supported Interface & Recognition Languages",
    sec2Desc: "SmartNotes AI is fully localized for users worldwide: Russian (RU), English (EN), Spanish (ES), French (FR), German (DE), and Arabic (AR). Switch languages anytime in 1 click using the top-right selector.",
    sec3Title: "3. How to Use Key Features",
    feat1Title: "🎙️ Real-time Voice Dictation (Speech-to-Text)",
    feat1Desc: "Tap the microphone icon inside any note and speak naturally. The app transcribes your voice into structured text, punctuates automatically, and organizes thoughts into paragraphs. Perfect on the go or while driving.",
    feat2Title: "✨ Smart AI Summaries & Assistant (Gemini 3.8)",
    feat2Desc: "Paste lengthy articles, lecture notes, or meeting minutes and click 'Summarize with AI'. In seconds, the neural network extracts key takeaways, action items, and clear task lists.",
    feat3Title: "🔒 Secret PIN-Protected Notes",
    feat3Desc: "Protect personal thoughts, passwords, or confidential plans with a 4-digit PIN lock. Data is strongly encrypted and hidden from list previews until you unlock it.",
    feat4Title: "💬 AI Chat & Photo Object Recognition",
    feat4Desc: "Attach photos of gadgets, watches, recipes, or documents into the AI assistant chat. The AI identifies objects, translates text from images, and answers questions.",
    feat5Title: "☁️ Real-time Cloud Sync across Devices",
    feat5Desc: "Start taking a note on your phone, continue editing on your desktop at home. Seamless cloud synchronization for up to 3 devices keeps all your notes safe and accessible.",
    printGuideBtn: "📄 Print User Guide"
  },
  de: {
    backHome: "← Zurück zur Startseite",
    printPdf: "📄 Drucken / PDF",
    openWebApp: "🌐 Web-Notizbuch öffnen",
    badge: "📖 Offizielles Benutzerhandbuch",
    title: "SmartNotes AI Benutzerhandbuch",
    subtitle: "Intelligentes mehrsprachiges KI-Notizbuch in 6 Sprachen. Alles über die universelle Web-App, Sprachdiktat, Gemini-KI und Notizschutz.",
    savePdfBtn: "📥 Anleitung als PDF speichern",
    launchAppBtn: "🚀 Online-Notizbuch starten",
    sec1Title: "1. So nutzen Sie die universelle Web-App",
    sec1Desc: "Die Web-Version von SmartNotes AI ist eine vollwertige Progressive Web App (PWA). Keine App-Stores erforderlich: Sie läuft blitzschnell im Browser jedes Geräts – Android, iPhone, Windows, Mac, Linux und Aurora OS. Sie schont den Gerätespeicher und ist immer auf dem neuesten Stand.",
    addToHomeTitle: "📱 Symbol zum Startbildschirm hinzufügen (1 Klick):",
    androidTitle: "🤖 Android (Chrome / Brave)",
    androidStep1: "Öffnen Sie",
    androidStep2: "Tippen Sie oben rechts auf die drei Punkte ⋮",
    androidStep3: "Wählen Sie „App installieren“ oder „Zum Startbildschirm hinzufügen“",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "Öffnen Sie",
    iosStep1Suffix: "in Safari",
    iosStep2: "Tippen Sie auf die Schaltfläche „Teilen“ (Quadrat mit Pfeil ⎋)",
    iosStep3: "Scrollen Sie nach unten und wählen Sie „Zum Home-Bildschirm“",
    pcTitle: "💻 PC / Laptop / Desktop",
    pcStep1: "Öffnen Sie die Website in Chrome / Edge / Brave",
    pcStep2: "Klicken Sie rechts in der Adressleiste auf das Symbol ⊕ („Installieren“)",
    pcStep3: "Das App-Symbol erscheint wie ein eigenständiges Programm auf Ihrem Desktop!",
    auroraTitle: "🛡️ Aurora OS (RPM)",
    auroraDesc: "Native RPM-Pakete für Aurora OS-Geräte:",
    auroraPkg64: "64-Bit-Paket (.rpm)",
    auroraPkg32: "32-Bit-Paket (.rpm)",
    sec2Title: "2. Unterstützung von 6 Sprachen",
    sec2Desc: "SmartNotes AI ist vollständig für Benutzer weltweit angepasst: Russisch (RU), Englisch (EN), Spanisch (ES), Französisch (FR), Deutsch (DE) und Arabisch (AR). Wechseln Sie die Sprache mit 1 Klick oben rechts im Menü.",
    sec3Title: "3. Nutzung der Hauptfunktionen",
    feat1Title: "🎙️ Spracheingabe in Echtzeit (Speech-to-Text)",
    feat1Desc: "Tippen Sie in einer beliebigen Notiz auf das Mikrofonsymbol und sprechen Sie frei. Die App wandelt Sprache in Echtzeit in Text um, setzt Satzzeichen und strukturiert Absätze.",
    feat2Title: "✨ Intelligente KI-Zusammenfassungen (Gemini 3.8)",
    feat2Desc: "Fügen Sie lange Artikel oder Protokolle ein und klicken Sie auf „Mit KI zusammenfassen“. Die KI filtert in Sekundenschnelle das Wichtigste heraus und erstellt Aufgabenlisten.",
    feat3Title: "🔒 Geheime Notizen mit PIN-Schutz",
    feat3Desc: "Schützen Sie persönliche Gedanken, Passwörter oder vertrauliche Pläne mit einer 4-stelligen PIN. Inhalte werden verschlüsselt und ohne PIN nicht in der Vorschau angezeigt.",
    feat4Title: "💬 KI-Chat & Foto-Objekterkennung",
    feat4Desc: "Hängen Sie Fotos von Uhren, Geräten oder Dokumenten an den Chat an. Die KI erkennt Modelle, übersetzt Text aus Bildern und beantwortet Detailfragen.",
    feat5Title: "☁️ Echtzeit-Cloud-Synchronisation",
    feat5Desc: "Beginnen Sie eine Notiz auf dem Smartphone unterwegs und bearbeiten Sie sie am PC zu Hause weiter. Die Synchronisation für bis zu 3 Geräte schützt vor Datenverlust.",
    printGuideBtn: "📄 Anleitung drucken"
  },
  fr: {
    backHome: "← Retour à l'accueil",
    printPdf: "📄 Imprimer / PDF",
    openWebApp: "🌐 Ouvrir le bloc-notes Web",
    badge: "📖 Guide officiel de l'utilisateur",
    title: "Guide de l'utilisateur SmartNotes AI",
    subtitle: "Bloc-notes intelligent avec IA en 6 langues. Guide complet de la version Web universelle, de la dictée vocale, de Gemini AI et de la confidentialité.",
    savePdfBtn: "📥 Enregistrer le guide en PDF",
    launchAppBtn: "🚀 Ouvrir le bloc-notes en ligne",
    sec1Title: "1. Comment utiliser l'application Web universelle",
    sec1Desc: "La version Web de SmartNotes AI est une Progressive Web App (PWA) complète. Aucun magasin d'applications requis : elle fonctionne instantanément dans n'importe quel navigateur sur Android, iPhone, Windows, Mac, Linux et Aurora OS, sans encombrer la mémoire.",
    addToHomeTitle: "📱 Ajouter l'icône à l'écran d'accueil (en 1 clic) :",
    androidTitle: "🤖 Android (Chrome / Brave)",
    androidStep1: "Ouvrez",
    androidStep2: "Appuyez sur les trois points ⋮ en haut à droite",
    androidStep3: "Sélectionnez « Installer l'application » ou « Ajouter à l'écran d'accueil »",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "Ouvrez",
    iosStep1Suffix: "dans Safari",
    iosStep2: "Appuyez sur le bouton « Partager » (carré avec flèche ⎋)",
    iosStep3: "Faites défiler vers le bas et choisissez « Sur l'écran d'accueil »",
    pcTitle: "💻 PC / Ordinateur portable",
    pcStep1: "Ouvrez le site dans Chrome / Edge / Brave",
    pcStep2: "Dans la barre d'adresse à droite, cliquez sur l'icône ⊕ (« Installer »)",
    pcStep3: "L'icône apparaîtra sur votre bureau comme une application autonome !",
    auroraTitle: "🛡️ Aurora OS (RPM)",
    auroraDesc: "Paquets RPM natifs pour appareils Aurora OS :",
    auroraPkg64: "Paquet 64 bits (.rpm)",
    auroraPkg32: "Paquet 32 bits (.rpm)",
    sec2Title: "2. Support de 6 langues",
    sec2Desc: "SmartNotes AI est entièrement traduit pour les utilisateurs du monde entier : russe (RU), anglais (EN), espagnol (ES), français (FR), allemand (DE) et arabe (AR). Changez de langue en 1 clic dans le menu en haut à droite.",
    sec3Title: "3. Comment utiliser les fonctionnalités clés",
    feat1Title: "🎙️ Saisie vocale en direct (Speech-to-Text)",
    feat1Desc: "Appuyez sur l'icône du micro dans une note et parlez naturellement. L'application convertit instantanément votre voix en texte, ponctue et organise vos idées en paragraphes.",
    feat2Title: "✨ Résumés intelligents par IA (Gemini 3.8)",
    feat2Desc: "Collez de longs articles, cours ou comptes-rendus et cliquez sur « Résumer avec l'IA ». L'IA extrait l'essentiel et génère un plan d'action en quelques secondes.",
    feat3Title: "🔒 Notes secrètes protégées par PIN",
    feat3Desc: "Protégez vos notes confidentielles et mots de passe avec un code PIN à 4 chiffres. Le contenu est chiffré et masqué de la liste sans le code.",
    feat4Title: "💬 Chat IA et reconnaissance par photo",
    feat4Desc: "Joignez une photo d'objet, de recette ou de document au chat. L'IA identifie les modèles, traduit le texte extrait de l'image et répond à vos questions.",
    feat5Title: "☁️ Synchronisation cloud en temps réel",
    feat5Desc: "Commencez une note sur votre téléphone et poursuivez sur votre ordinateur. La synchronisation jusqu'à 3 appareils garantit la sécurité de vos données.",
    printGuideBtn: "📄 Imprimer le guide"
  },
  es: {
    backHome: "← Volver al inicio",
    printPdf: "📄 Imprimir / PDF",
    openWebApp: "🌐 Abrir bloc de notas web",
    badge: "📖 Guía oficial del usuario",
    title: "Guía del usuario de SmartNotes AI",
    subtitle: "Bloc de notas inteligente con IA en 6 idiomas. Guía completa de la versión web universal, dictado por voz, IA Gemini y privacidad.",
    savePdfBtn: "📥 Guardar guía en PDF",
    launchAppBtn: "🚀 Abrir bloc de notas online",
    sec1Title: "1. Cómo usar la aplicación web universal",
    sec1Desc: "La versión web de SmartNotes AI es una Progressive Web App (PWA) completa. No requiere tiendas de aplicaciones: funciona al instante en cualquier navegador en Android, iPhone, Windows, Mac, Linux y Aurora OS, ahorrando espacio en el dispositivo.",
    addToHomeTitle: "📱 Añadir icono a la pantalla de inicio (en 1 clic):",
    androidTitle: "🤖 Android (Chrome / Brave)",
    androidStep1: "Abra",
    androidStep2: "Toque los tres puntos ⋮ en la esquina superior derecha",
    androidStep3: "Seleccione «Instalar aplicación» o «Añadir a la pantalla de inicio»",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "Abra",
    iosStep1Suffix: "en Safari",
    iosStep2: "Toque el botón «Compartir» (cuadrado con flecha ⎋)",
    iosStep3: "Desplácese hacia abajo y elija «Añadir a pantalla de inicio»",
    pcTitle: "💻 PC / Portátil / Desktop",
    pcStep1: "Abra el sitio web en Chrome / Edge / Brave",
    pcStep2: "En la barra de direcciones a la derecha, haga clic en el icono ⊕ («Instalar»)",
    pcStep3: "¡El icono aparecerá en su escritorio como un programa independiente!",
    auroraTitle: "🛡️ Aurora OS (RPM)",
    auroraDesc: "Paquetes RPM nativos para dispositivos Aurora OS:",
    auroraPkg64: "Paquete de 64 bits (.rpm)",
    auroraPkg32: "Paquete de 32 bits (.rpm)",
    sec2Title: "2. Soporte para 6 idiomas",
    sec2Desc: "SmartNotes AI está completamente adaptado para usuarios de todo el mundo: ruso (RU), inglés (EN), español (ES), francés (FR), alemán (DE) y árabe (AR). Cambie de idioma con 1 clic en la esquina superior derecha.",
    sec3Title: "3. Cómo usar las funciones principales",
    feat1Title: "🎙️ Dictado por voz en tiempo real (Speech-to-Text)",
    feat1Desc: "Toque el icono de micrófono en cualquier nota y hable. La aplicación transcribe su voz a texto al instante, añade puntuación y divide las ideas en párrafos.",
    feat2Title: "✨ Resúmenes inteligentes con IA (Gemini 3.8)",
    feat2Desc: "Pegue artículos largos o actas de reuniones y haga clic en «Resumir con IA». La red neuronal destaca lo esencial y crea listas de tareas en segundos.",
    feat3Title: "🔒 Notas secretas protegidas con PIN",
    feat3Desc: "Proteja pensamientos privados, contraseñas y planes confidenciales con un código PIN de 4 dígitos. Los datos están cifrados y ocultos de la vista previa.",
    feat4Title: "💬 Chat con IA y reconocimiento por foto",
    feat4Desc: "Adjunte fotos de objetos, recetas o documentos al chat. La IA identifica modelos, traduce texto de imágenes y responde a sus consultas.",
    feat5Title: "☁️ Sincronización en la nube en tiempo real",
    feat5Desc: "Empiece una nota en su móvil y continúe editándola en su ordenador. La sincronización en hasta 3 dispositivos garantiza que nunca pierda sus apuntes.",
    printGuideBtn: "📄 Imprimir guía"
  },
  ar: {
    backHome: "← العودة للرئيسية",
    printPdf: "📄 طباعة / PDF",
    openWebApp: "🌐 فتح دفتر الملاحظات",
    badge: "📖 دليل المستخدم الرسمي",
    title: "دليل مستخدم SmartNotes AI",
    subtitle: "دفتر ملاحظات ذكي مدعوم بالذكاء الاصطناعي بـ 6 لغات. دليل شامل لتطبيق الويب، الإملاء الصوتي، ذكاء Gemini، وحماية الملاحظات.",
    savePdfBtn: "📥 حفظ الدليل بصيغة PDF",
    launchAppBtn: "🚀 فتح دفتر الملاحظات عبر الإنترنت",
    sec1Title: "1. كيفية استخدام تطبيق الويب الشامل",
    sec1Desc: "إصدار الويب من SmartNotes AI هو تطبيق ويب تقدمي (PWA) متكامل. لا حاجة لمتاجر التطبيقات: يعمل فوراً في أي متصفح على Android وiPhone وWindows وMac وLinux ونظام Aurora، موفراً مساحة التخزين.",
    addToHomeTitle: "📱 إضافة الأيقونة إلى الشاشة الرئيسية (بنقرة واحدة):",
    androidTitle: "🤖 Android (Chrome / Brave)",
    androidStep1: "افتح",
    androidStep2: "اضغط على النقاط الثلاث ⋮ في الزاوية العلوية",
    androidStep3: "اختر \"تثبيت التطبيق\" أو \"إضافة إلى الشاشة الرئيسية\"",
    iosTitle: "🍏 iPhone / iPad (Safari)",
    iosStep1: "افتح",
    iosStep1Suffix: "في متصفح Safari",
    iosStep2: "اضغط على زر \"مشاركة\" (مربع به سهم ⎋)",
    iosStep3: "مرر لأسفل واختر \"إضافة إلى الشاشة الرئيسية\"",
    pcTitle: "💻 الكمبيوتر / الحاسوب المحمول",
    pcStep1: "افتح الموقع في متصفح Chrome أو Edge أو Brave",
    pcStep2: "في شريط العناوين على اليمين، انقر على أيقونة ⊕ (\"تثبيت\")",
    pcStep3: "ستظهر أيقونة التطبيق على سطح المكتب كبرنامج مستقل!",
    auroraTitle: "🛡️ نظام أورورا (RPM)",
    auroraDesc: "حزم RPM الأصلية لأجهزة نظام أورورا:",
    auroraPkg64: "حزمة 64 بت (.rpm)",
    auroraPkg32: "حزمة 32 بت (.rpm)",
    sec2Title: "2. دعم 6 لغات",
    sec2Desc: "تم تكييف SmartNotes AI بالكامل للمستخدمين حول العالم: الروسية والإنجليزية والإسبانية والفرنسية والألمانية والعربية. يمكن تبديل اللغة بنقرة واحدة من القائمة العلوية.",
    sec3Title: "3. كيفية استخدام الميزات الرئيسية",
    feat1Title: "🎙️ الإملاء الصوتي الفوري (Speech-to-Text)",
    feat1Desc: "اضغط على أيقونة الميكروفون داخل أي ملاحظة وتحدث. يقوم التطبيق بتحويل الصوت إلى نص فوراً مع علامات الترقيم وتنظيم الفقرات تلقائياً.",
    feat2Title: "✨ التلخيص الذكي بالذكاء الاصطناعي (Gemini 3.8)",
    feat2Desc: "الصق المقالات الطويلة أو مذكرات الاجتماعات واضغط على 'تلخيص بالذكاء الاصطناعي'. يستخرج الذكاء الاصطناعي أهم النقاط وخطة العمل في ثوانٍ.",
    feat3Title: "🔒 ملاحظات سرية برمز PIN",
    feat3Desc: "احمِ أفكارك الخاصة وكلمات المرور برمز PIN مكون من 4 أرقام. المحتوى مشفر ومخفي عن القائمة العامة حتى إدخال الرمز.",
    feat4Title: "💬 محادثة الذكاء الاصطناعي والتعرف على الصور",
    feat4Desc: "أرفق صور الساعات أو الأجهزة أو المستندات في المحادثة. يتعرف الذكاء الاصطناعي على النماذج ويترجم النصوص ويجيب على أسئلتك.",
    feat5Title: "☁️ مزامنة سحابية فورية بين الأجهزة",
    feat5Desc: "ابدأ كتابة الملاحظة على هاتفك وأكمل تحريرها على حاسوبك في المنزل. تضمن المزامنة حتى 3 أجهزة عدم فقدان بياناتك الهامة أبداً.",
    printGuideBtn: "📄 طباعة الدليل"
  }
};

export default function GuidePage() {
  const { t, language, setLanguage } = useLanguage();
  const g = guideI18n[language] || guideI18n.en;
  const isRtl = language === "ar";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="bg-[#0A0A0A] text-white min-h-screen selection:bg-purple-500 selection:text-white font-sans"
    >
      {/* Navigation (скрывается при печати) */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="SmartNotes AI Icon"
              className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] object-cover"
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight">SmartNotes AI</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
            >
              {g.backHome}
            </Link>

            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              {g.printPdf}
            </button>

            <a
              href="/app"
              className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-[0_0_15px_rgba(147,51,234,0.4)]"
            >
              {g.openWebApp}
            </a>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer text-white font-medium"
            >
              <option value="ru" className="text-black">RU</option>
              <option value="en" className="text-black">EN</option>
              <option value="es" className="text-black">ES</option>
              <option value="fr" className="text-black">FR</option>
              <option value="de" className="text-black">DE</option>
              <option value="ar" className="text-black">AR</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto print:pt-4 print:pb-4 print:text-black print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-16 print:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4 print:hidden">
            {g.badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 print:text-3xl print:text-black">
            {g.title}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed print:text-gray-700">
            {g.subtitle}
          </p>

          <div className="mt-8 flex justify-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-sm transition-all flex items-center gap-2"
            >
              {g.savePdfBtn}
            </button>
            <a
              href="/app"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all"
            >
              {g.launchAppBtn}
            </a>
          </div>
        </div>

        {/* SECTION 1: WEB VERSION (PWA) */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌐</span>
            <h2 className="text-2xl font-bold print:text-black">
              {g.sec1Title}
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6 print:text-gray-800">
            {g.sec1Desc}
          </p>

          <h3 className="text-lg font-bold text-purple-300 mb-4 print:text-purple-800">
            {g.addToHomeTitle}
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Android */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">{g.androidTitle}</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>{g.androidStep1} <strong>smartnotes-ai.ru/app</strong></li>
                <li>{g.androidStep2}</li>
                <li>{g.androidStep3}</li>
              </ol>
            </div>

            {/* iOS */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">{g.iosTitle}</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>{g.iosStep1} <strong>smartnotes-ai.ru/app</strong> {g.iosStep1Suffix}</li>
                <li>{g.iosStep2}</li>
                <li>{g.iosStep3}</li>
              </ol>
            </div>

            {/* PC */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">{g.pcTitle}</div>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside print:text-gray-700">
                <li>{g.pcStep1}</li>
                <li>{g.pcStep2}</li>
                <li>{g.pcStep3}</li>
              </ol>
            </div>

            {/* Aurora OS */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 print:border-gray-200 print:bg-gray-50">
              <div className="font-bold mb-1 text-sm text-purple-400 print:text-purple-900">{g.auroraTitle}</div>
              <p className="text-xs text-gray-300 mb-2 print:text-gray-700">
                {g.auroraDesc}
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                <a href="/SmartNotes-Aurora-arm64.rpm" download="SmartNotes-Aurora-arm64.rpm" className="text-xs text-blue-400 hover:text-blue-300 underline font-medium">
                  📦 {g.auroraPkg64}
                </a>
                <a href="/SmartNotes-Aurora-arm32.rpm" download="SmartNotes-Aurora-arm32.rpm" className="text-xs text-blue-400 hover:text-blue-300 underline font-medium">
                  📦 {g.auroraPkg32}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 6 LANGUAGES */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h2 className="text-2xl font-bold print:text-black">
              {g.sec2Title}
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4 print:text-gray-800">
            {g.sec2Desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {["🇷🇺 Русский", "🇬🇧 English", "🇪🇸 Español", "🇫🇷 Français", "🇩🇪 Deutsch", "🇸🇦 العربية"].map((l) => (
              <span key={l} className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-200 print:text-gray-800 print:border-gray-300">
                {l}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 3: CORE FEATURES GUIDE */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 print:border-gray-300 print:bg-white print:p-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚡</span>
            <h2 className="text-2xl font-bold print:text-black">
              {g.sec3Title}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                {g.feat1Title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {g.feat1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                {g.feat2Title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {g.feat2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                {g.feat3Title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {g.feat3Desc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                {g.feat4Title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {g.feat4Desc}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border-b border-white/10 pb-5 last:border-0 print:border-gray-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                {g.feat5Title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed print:text-gray-700">
                {g.feat5Desc}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FEEDBACK & SUPPORT */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-black border border-purple-500/30 print:border-gray-300 print:bg-white print:p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            💡 {t('feedback_title')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 print:text-black">
            {t('feedback_title')}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-6 print:text-gray-700">
            {t('feedback_desc')}
          </p>
          <div className="flex flex-wrap gap-4 print:hidden">
            <a
              href="mailto:autoneuro24@gmail.com?subject=SmartNotes%20AI%20Feedback%20and%20Bug%20Report"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-2"
            >
              ✉️ {t('feedback_btn')} (autoneuro24@gmail.com)
            </a>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold"
            >
              {g.printGuideBtn}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
