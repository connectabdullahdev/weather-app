/* ============================================
   AURA ETHEREAL — script.js v6
   ============================================
   ALL ORIGINAL FEATURES PRESERVED:
   1. City Bookmarks
   2. Share Weather (fixed)
   3. Map Layer Switcher
   4. Wind Unit Toggle
   5. Hourly Toggle (Temp/Rain)
   6. Clickable 7-day chart
   7. Trivia card
   8. Packing Suggestions
   9. City Comparison
   10. Weekend Countdown

   NEW ADDITIONS:
   A. Language Switcher (EN/UR/ES/HI/DE)
   B. Dark/Light Mode Toggle
   C. Auto Day/Night Color Theme
   D. Folder/Section UI
   E. Real Feel Thermometer
   F. Weather Mood Ring
   G. Wind Speed Meter (Beaufort)
   H. Air Breathability Score
   I. Precipitation 7-Day Timeline
   J. Multi-City World Ticker
   K. Activity Recommender
   L. Alert History
   M. Outdoor/Crop Planner
   N. Feels Like vs Actual Chart
============================================ */
'use strict';

const KEY = "9f40db7e3bbb441f935210830260204";

let tempChart         = null;
let feelRealChart     = null;
let lightningInterval = null;
let isCelsius         = true;
let isKmh             = true;
let lastData          = null;
let currentLat        = null;
let currentLon        = null;
let currentMapLayer   = 'wind';
let hourlyMode        = 'temp';
let triviaIndex       = 0;
let bookmarks         = [];
let forecastDays      = [];
let currentLang       = 'en';
let currentTheme      = 'dark';
let isManualTheme     = false;
let alertHistory      = [];

try { bookmarks = JSON.parse(localStorage.getItem('aura_bm') || '[]'); } catch(e){ bookmarks=[]; }
try { currentLang = localStorage.getItem('aura_lang') || 'en'; } catch(e){}
try { currentTheme = localStorage.getItem('aura_theme') || 'dark'; isManualTheme = !!localStorage.getItem('aura_theme'); } catch(e){}

/* ══════════════════════════════════════════
   TRANSLATIONS
══════════════════════════════════════════ */
const LANGS = {
    en: {
        flag: '🇺🇸',
        pull_refresh: 'Pull to Refresh',
        copied: 'Copied to clipboard!',
        search_city: 'Search city...',
        detecting: 'Detecting atmosphere...',
        sec_current: 'Current Weather',
        sec_wind: 'Wind & Air Quality',
        sec_forecast: 'Hourly & 7-Day Forecast',
        sec_map: 'Live Weather Map',
        sec_compare: 'Compare Cities',
        sec_smart: 'Smart Features',
        high: 'HIGH', low: 'LOW', moon: 'MOON',
        humidity: 'Humidity', wind: 'Wind', feels_like: 'Feels Like',
        visibility: 'Visibility', pressure: 'Pressure', uv_index: 'UV Index',
        dew_point: 'Dew Point', cloud_cover: 'Cloud Cover', wind_gust: 'Wind Gust',
        heat_index: 'Heat Index', rain_chance: 'Rain Chance',
        uv_low: 'Low', uv_mod: 'Moderate', uv_high: 'High', uv_vhigh: 'Very High', uv_ext: 'Extreme',
        comfort_index: 'Comfort Index',
        c_harsh: 'Harsh', c_poor: 'Poor', c_fair: 'Fair', c_good: 'Good', c_ideal: 'Ideal',
        sunrise: 'Sunrise', sunset: 'Sunset', daylight: 'Daylight',
        real_feel: 'Real Feel Thermometer',
        weather_mood: 'Weather Mood',
        air_quality: 'Air Quality (Est.)',
        wind_meter: 'Wind Speed Meter',
        beaufort: 'Beaufort Scale: ',
        breathe: 'Air Breathability',
        hourly_forecast: '24-Hour Forecast',
        temp: 'Temp', rain: 'Rain',
        weekly_trend: '7-Day Trend', tap_day: 'tap a day →',
        weekly_forecast: '7-Day Forecast',
        hourly_rain: 'Hourly Rainfall (mm)',
        precip_timeline: '7-Day Precipitation',
        live_map: 'Live Map',
        loading_map: 'Loading map...',
        cloud: 'Cloud',
        compare_placeholder: 'Compare with city...',
        go: 'Go',
        world_cities: 'World Cities Live',
        did_you_know: 'Did You Know?',
        tap_next: 'Tap for next fact →',
        what_to_carry: '🎒 What to Carry',
        weather_score: "Today's Weather Score",
        best_activities: 'Best Activities Today',
        alert_history: 'Recent Alerts',
        outdoor_planner: '🌱 Outdoor Planner',
        feel_vs_real: 'Feels Like vs Actual (7-Day)',
        updated: 'Updated',
        location_not_found: 'Location not found — try again.',
    },
    ur: {
        flag: '🇵🇰',
        pull_refresh: 'ریفریش کریں',
        copied: 'کلپ بورڈ پر کاپی ہوگیا!',
        search_city: 'شہر تلاش کریں...',
        detecting: 'ماحول جانچا جا رہا ہے...',
        sec_current: 'موجودہ موسم',
        sec_wind: 'ہوا اور فضائی معیار',
        sec_forecast: 'گھنٹہ وار اور 7 دن کی پیشگوئی',
        sec_map: 'لائیو موسمی نقشہ',
        sec_compare: 'شہروں کا موازنہ',
        sec_smart: 'ذہین خصوصیات',
        high: 'زیادہ', low: 'کم', moon: 'چاند',
        humidity: 'نمی', wind: 'ہوا', feels_like: 'احساس',
        visibility: 'مرئیت', pressure: 'دباؤ', uv_index: 'UV انڈیکس',
        dew_point: 'شبنم نقطہ', cloud_cover: 'بادل', wind_gust: 'جھکڑ',
        heat_index: 'حرارت انڈیکس', rain_chance: 'بارش کا امکان',
        uv_low: 'کم', uv_mod: 'معتدل', uv_high: 'زیادہ', uv_vhigh: 'بہت زیادہ', uv_ext: 'انتہائی',
        comfort_index: 'آرام انڈیکس',
        c_harsh: 'سخت', c_poor: 'خراب', c_fair: 'ٹھیک', c_good: 'اچھا', c_ideal: 'بہترین',
        sunrise: 'طلوع آفتاب', sunset: 'غروب آفتاب', daylight: 'دن کی روشنی',
        real_feel: 'حقیقی احساس تھرمامیٹر',
        weather_mood: 'موسم کا موڈ',
        air_quality: 'فضائی معیار',
        wind_meter: 'ہوا کی رفتار',
        beaufort: 'بیوفورٹ اسکیل: ',
        breathe: 'سانس لینے کی صلاحیت',
        hourly_forecast: '24 گھنٹے کی پیشگوئی',
        temp: 'درجہ حرارت', rain: 'بارش',
        weekly_trend: '7 دن کا رجحان', tap_day: 'دن چھوئیں →',
        weekly_forecast: '7 دن کی پیشگوئی',
        hourly_rain: 'گھنٹہ وار بارش (mm)',
        precip_timeline: '7 دن کی بارش',
        live_map: 'لائیو نقشہ',
        loading_map: 'نقشہ لوڈ ہو رہا ہے...',
        cloud: 'بادل',
        compare_placeholder: 'شہر کا موازنہ کریں...',
        go: 'جاؤ',
        world_cities: 'دنیا کے شہر',
        did_you_know: 'کیا آپ جانتے ہیں؟',
        tap_next: 'اگلی حقیقت کے لیے چھوئیں →',
        what_to_carry: '🎒 کیا ساتھ لے جائیں',
        weather_score: 'آج کا موسم اسکور',
        best_activities: 'آج کی بہترین سرگرمیاں',
        alert_history: 'حالیہ اطلاعات',
        outdoor_planner: '🌱 باہری منصوبہ',
        feel_vs_real: 'احساس بمقابلہ اصل (7 دن)',
        updated: 'اپڈیٹ',
        location_not_found: 'مقام نہیں ملا — دوبارہ کوشش کریں۔',
    },
    es: {
        flag: '🇪🇸',
        pull_refresh: 'Jalar para actualizar',
        copied: '¡Copiado al portapapeles!',
        search_city: 'Buscar ciudad...',
        detecting: 'Detectando atmósfera...',
        sec_current: 'Clima Actual',
        sec_wind: 'Viento y Calidad del Aire',
        sec_forecast: 'Pronóstico por Hora y 7 Días',
        sec_map: 'Mapa Meteorológico en Vivo',
        sec_compare: 'Comparar Ciudades',
        sec_smart: 'Funciones Inteligentes',
        high: 'MÁX', low: 'MÍN', moon: 'LUNA',
        humidity: 'Humedad', wind: 'Viento', feels_like: 'Sensación',
        visibility: 'Visibilidad', pressure: 'Presión', uv_index: 'Índice UV',
        dew_point: 'Punto Rocío', cloud_cover: 'Nubosidad', wind_gust: 'Ráfaga',
        heat_index: 'Índice Calor', rain_chance: 'Prob. Lluvia',
        uv_low: 'Bajo', uv_mod: 'Moderado', uv_high: 'Alto', uv_vhigh: 'Muy Alto', uv_ext: 'Extremo',
        comfort_index: 'Índice Confort',
        c_harsh: 'Severo', c_poor: 'Malo', c_fair: 'Regular', c_good: 'Bueno', c_ideal: 'Ideal',
        sunrise: 'Amanecer', sunset: 'Atardecer', daylight: 'Luz del día',
        real_feel: 'Termómetro Sensación Real',
        weather_mood: 'Estado del Tiempo',
        air_quality: 'Calidad del Aire (Est.)',
        wind_meter: 'Velocímetro de Viento',
        beaufort: 'Escala Beaufort: ',
        breathe: 'Respirabilidad del Aire',
        hourly_forecast: 'Pronóstico 24 Horas',
        temp: 'Temp', rain: 'Lluvia',
        weekly_trend: 'Tendencia 7 Días', tap_day: 'toca un día →',
        weekly_forecast: 'Pronóstico 7 Días',
        hourly_rain: 'Lluvia por Hora (mm)',
        precip_timeline: 'Precipitación 7 Días',
        live_map: 'Mapa en Vivo',
        loading_map: 'Cargando mapa...',
        cloud: 'Nube',
        compare_placeholder: 'Comparar con ciudad...',
        go: 'Ir',
        world_cities: 'Ciudades del Mundo',
        did_you_know: '¿Sabías que?',
        tap_next: 'Toca para siguiente →',
        what_to_carry: '🎒 Qué Llevar',
        weather_score: 'Puntuación del Tiempo Hoy',
        best_activities: 'Mejores Actividades Hoy',
        alert_history: 'Alertas Recientes',
        outdoor_planner: '🌱 Planificador Exterior',
        feel_vs_real: 'Sensación vs Real (7 Días)',
        updated: 'Actualizado',
        location_not_found: 'Ciudad no encontrada — intenta de nuevo.',
    },
    hi: {
        flag: '🇮🇳',
        pull_refresh: 'रिफ्रेश करने के लिए खींचें',
        copied: 'क्लिपबोर्ड पर कॉपी हुआ!',
        search_city: 'शहर खोजें...',
        detecting: 'वातावरण जाँच रहे हैं...',
        sec_current: 'वर्तमान मौसम',
        sec_wind: 'हवा और वायु गुणवत्ता',
        sec_forecast: 'प्रति घंटा और 7 दिन का पूर्वानुमान',
        sec_map: 'लाइव मौसम नक्शा',
        sec_compare: 'शहरों की तुलना',
        sec_smart: 'स्मार्ट सुविधाएं',
        high: 'अधिक', low: 'कम', moon: 'चंद्रमा',
        humidity: 'नमी', wind: 'हवा', feels_like: 'अनुभव',
        visibility: 'दृश्यता', pressure: 'दबाव', uv_index: 'UV सूचकांक',
        dew_point: 'ओस बिंदु', cloud_cover: 'बादल', wind_gust: 'झोंका',
        heat_index: 'ताप सूचकांक', rain_chance: 'बारिश की संभावना',
        uv_low: 'कम', uv_mod: 'मध्यम', uv_high: 'अधिक', uv_vhigh: 'बहुत अधिक', uv_ext: 'चरम',
        comfort_index: 'आराम सूचकांक',
        c_harsh: 'कठोर', c_poor: 'खराब', c_fair: 'ठीक', c_good: 'अच्छा', c_ideal: 'आदर्श',
        sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', daylight: 'दिन की रोशनी',
        real_feel: 'वास्तविक अनुभव थर्मामीटर',
        weather_mood: 'मौसम का मूड',
        air_quality: 'वायु गुणवत्ता (अनुमानित)',
        wind_meter: 'हवा गति मीटर',
        beaufort: 'ब्यूफोर्ट स्केल: ',
        breathe: 'हवा में सांस लेने योग्यता',
        hourly_forecast: '24 घंटे का पूर्वानुमान',
        temp: 'तापमान', rain: 'बारिश',
        weekly_trend: '7 दिन की प्रवृत्ति', tap_day: 'दिन टैप करें →',
        weekly_forecast: '7 दिन का पूर्वानुमान',
        hourly_rain: 'प्रति घंटा वर्षा (mm)',
        precip_timeline: '7 दिन की वर्षा',
        live_map: 'लाइव नक्शा',
        loading_map: 'नक्शा लोड हो रहा है...',
        cloud: 'बादल',
        compare_placeholder: 'शहर से तुलना करें...',
        go: 'जाएं',
        world_cities: 'विश्व के शहर',
        did_you_know: 'क्या आप जानते हैं?',
        tap_next: 'अगला तथ्य टैप करें →',
        what_to_carry: '🎒 क्या ले जाएं',
        weather_score: 'आज का मौसम स्कोर',
        best_activities: 'आज की सर्वोत्तम गतिविधियाँ',
        alert_history: 'हालिया अलर्ट',
        outdoor_planner: '🌱 बाहरी योजनाकार',
        feel_vs_real: 'अनुभव बनाम वास्तविक (7 दिन)',
        updated: 'अपडेट',
        location_not_found: 'स्थान नहीं मिला — फिर कोशिश करें।',
    },
    de: {
        flag: '🇩🇪',
        pull_refresh: 'Zum Aktualisieren ziehen',
        copied: 'In die Zwischenablage kopiert!',
        search_city: 'Stadt suchen...',
        detecting: 'Atmosphäre wird erkannt...',
        sec_current: 'Aktuelles Wetter',
        sec_wind: 'Wind & Luftqualität',
        sec_forecast: 'Stündliche & 7-Tage-Prognose',
        sec_map: 'Live-Wetterkarte',
        sec_compare: 'Städte Vergleichen',
        sec_smart: 'Intelligente Funktionen',
        high: 'HOCH', low: 'TIEF', moon: 'MOND',
        humidity: 'Luftfeuchte', wind: 'Wind', feels_like: 'Gefühlt',
        visibility: 'Sicht', pressure: 'Druck', uv_index: 'UV-Index',
        dew_point: 'Taupunkt', cloud_cover: 'Bewölkung', wind_gust: 'Böe',
        heat_index: 'Hitzeindex', rain_chance: 'Regenwahrsch.',
        uv_low: 'Gering', uv_mod: 'Mäßig', uv_high: 'Hoch', uv_vhigh: 'Sehr Hoch', uv_ext: 'Extrem',
        comfort_index: 'Komfortindex',
        c_harsh: 'Hart', c_poor: 'Schlecht', c_fair: 'Ok', c_good: 'Gut', c_ideal: 'Ideal',
        sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang', daylight: 'Tageslicht',
        real_feel: 'Gefühltes Thermometer',
        weather_mood: 'Wetterstimmung',
        air_quality: 'Luftqualität (Schätz.)',
        wind_meter: 'Windgeschwindigkeitsmesser',
        beaufort: 'Beaufort-Skala: ',
        breathe: 'Luftatmungsqualität',
        hourly_forecast: '24-Stunden-Prognose',
        temp: 'Temp', rain: 'Regen',
        weekly_trend: '7-Tage-Trend', tap_day: 'Tag antippen →',
        weekly_forecast: '7-Tage-Prognose',
        hourly_rain: 'Stündl. Niederschlag (mm)',
        precip_timeline: '7-Tage-Niederschlag',
        live_map: 'Live-Karte',
        loading_map: 'Karte wird geladen...',
        cloud: 'Wolke',
        compare_placeholder: 'Mit Stadt vergleichen...',
        go: 'Los',
        world_cities: 'Weltstädte Live',
        did_you_know: 'Wussten Sie?',
        tap_next: 'Für nächste Tatsache tippen →',
        what_to_carry: '🎒 Was Mitnehmen',
        weather_score: 'Heutiger Wetter-Score',
        best_activities: 'Beste Aktivitäten Heute',
        alert_history: 'Neueste Warnungen',
        outdoor_planner: '🌱 Outdoor-Planer',
        feel_vs_real: 'Gefühlt vs Tatsächlich (7 Tage)',
        updated: 'Aktualisiert',
        location_not_found: 'Ort nicht gefunden — erneut versuchen.',
    }
};

function t(key){ return (LANGS[currentLang]||LANGS.en)[key] || (LANGS.en)[key] || key; }

function applyTranslations(){
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key=el.getAttribute('data-i18n');
        el.textContent=t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const key=el.getAttribute('data-i18n-placeholder');
        el.placeholder=t(key);
    });
    // RTL for Urdu
    document.body.classList.toggle('rtl-mode', currentLang==='ur');
    // Update flag
    const flagEl=document.getElementById('lang-flag');
    if(flagEl) flagEl.textContent=LANGS[currentLang]?.flag||'🌐';
}

function setLanguage(lang){
    currentLang=lang;
    try{ localStorage.setItem('aura_lang',lang); }catch(e){}
    toggleLangMenu();
    applyTranslations();
    // Re-render dynamic content if data loaded
    if(lastData) updateUI(lastData);
}

function toggleLangMenu(){
    const dd=document.getElementById('lang-dropdown');
    dd.classList.toggle('hidden');
}
document.addEventListener('click',e=>{
    if(!e.target.closest('.lang-menu-wrap')) document.getElementById('lang-dropdown')?.classList.add('hidden');
});

/* ══════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════ */
function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    const icon = document.getElementById('theme-icon');
    if(icon){ icon.setAttribute('data-lucide', theme==='dark'?'sun':'moon'); lucide.createIcons(); }
}

function toggleTheme(){
    isManualTheme = true;
    const newTheme = currentTheme==='dark' ? 'light' : 'dark';
    try{ localStorage.setItem('aura_theme', newTheme); }catch(e){}
    applyTheme(newTheme);
}

function autoThemeFromTime(sunriseStr, sunsetStr){
    if(isManualTheme) return;
    const srM=parseTime12(sunriseStr), ssM=parseTime12(sunsetStr);
    const nowM=new Date().getHours()*60+new Date().getMinutes();
    const isNight=nowM<srM||nowM>ssM;
    applyTheme(isNight?'dark':'light');
}

/* ══════════════════════════════════════════
   CLOCK
══════════════════════════════════════════ */
function updateClock(){
    const n=new Date();
    document.getElementById('system-time').textContent=
        [n.getHours(),n.getMinutes(),n.getSeconds()].map(x=>String(x).padStart(2,'0')).join(':');
}
updateClock(); setInterval(updateClock,1000);

/* ══════════════════════════════════════════
   TEMP UNIT
══════════════════════════════════════════ */
function setUnit(celsius){
    isCelsius=celsius;
    document.getElementById('btn-c').classList.toggle('active',celsius);
    document.getElementById('btn-f').classList.toggle('active',!celsius);
    if(lastData) applyUnits(lastData);
}
function toF(c){ return Math.round(c*9/5+32); }
function dispTemp(c){ return isCelsius ? Math.round(c) : toF(c); }
function unitSuffix(){ return isCelsius ? '°C' : '°F'; }

/* ══════════════════════════════════════════
   WIND UNIT
══════════════════════════════════════════ */
function setWindUnit(u){
    isKmh=(u==='kmh');
    document.getElementById('btn-kmh').classList.toggle('active',isKmh);
    document.getElementById('btn-mph').classList.toggle('active',!isKmh);
    if(lastData) applyWindDisplay(lastData.current.wind_kph, lastData.current.gust_kph||0);
}
function dispWind(kph){ return isKmh ? Math.round(kph)+' km/h' : Math.round(kph*0.621371)+' mph'; }
function applyWindDisplay(wind_kph, gust_kph){
    document.getElementById('windVal').textContent   = dispWind(wind_kph);
    document.getElementById('gustVal').textContent   = dispWind(gust_kph);
    document.getElementById('windSpeedLabel').textContent = dispWind(wind_kph);
}

/* ══════════════════════════════════════════
   FULL UNIT REAPPLY
══════════════════════════════════════════ */
function applyUnits(data){
    const cur=data.current, today=data.forecast.forecastday[0];
    document.getElementById('currentTemp').textContent  = dispTemp(cur.temp_c);
    document.getElementById('unitLabel').textContent    = unitSuffix();
    document.getElementById('feelsVal').textContent     = dispTemp(cur.feelslike_c)+unitSuffix();
    document.getElementById('heat-arc-val').textContent = dispTemp(cur.feelslike_c)+'°';
    document.getElementById('todayHigh').textContent    = dispTemp(today.day.maxtemp_c)+unitSuffix();
    document.getElementById('todayLow').textContent     = dispTemp(today.day.mintemp_c)+unitSuffix();
    document.getElementById('dewPointVal').textContent  = dispTemp(dewPoint(cur.temp_c,cur.humidity))+unitSuffix();
    applyWindDisplay(cur.wind_kph, cur.gust_kph||0);
    document.querySelectorAll('#weeklyGrid .f-card').forEach((card,i)=>{
        const d=data.forecast.forecastday[i]; if(!d) return;
        const s=card.querySelector('strong'), m=card.querySelector('.fc-min');
        if(s) s.textContent=dispTemp(d.day.maxtemp_c)+'°';
        if(m) m.textContent=dispTemp(d.day.mintemp_c)+'°';
    });
    if(hourlyMode==='temp'){
        document.querySelectorAll('#hourlyGrid .h-card strong').forEach((el,i)=>{
            const all=[...today.hour,...(data.forecast.forecastday[1]?data.forecast.forecastday[1].hour:[])];
            if(all[i]) el.textContent=dispTemp(all[i].temp_c)+'°';
        });
    }
}

/* ══════════════════════════════════════════
   DEW POINT
══════════════════════════════════════════ */
function dewPoint(t,h){
    const a=17.27,b=237.7;
    const alpha=(a*t)/(b+t)+Math.log(h/100);
    return (b*alpha)/(a-alpha);
}

/* ══════════════════════════════════════════
   TIME UTILS
══════════════════════════════════════════ */
function parseTime12(str){
    const p=str.trim().split(' ');
    let [h,m]=p[0].split(':').map(Number);
    if(p[1]==='PM'&&h!==12) h+=12;
    if(p[1]==='AM'&&h===12) h=0;
    return h*60+m;
}

/* ══════════════════════════════════════════
   DAY/NIGHT
══════════════════════════════════════════ */
function applyDayNight(sunriseStr,sunsetStr){
    const srM=parseTime12(sunriseStr), ssM=parseTime12(sunsetStr);
    const nowM=new Date().getHours()*60+new Date().getMinutes();
    const isNight=nowM<srM||nowM>ssM;
    document.querySelector('.main-canvas').classList.toggle('night-mode',isNight);
    const tag=document.getElementById('day-night-tag');
    if(isNight){ tag.textContent='✦ Night'; tag.className='night-tag'; }
    else        { tag.textContent='Synced';  tag.className='online-tag'; }
    // Auto color theme
    autoThemeFromTime(sunriseStr, sunsetStr);
}

/* ══════════════════════════════════════════
   SUN ARC
══════════════════════════════════════════ */
function updateSunArc(sunriseStr,sunsetStr){
    const srM=parseTime12(sunriseStr), ssM=parseTime12(sunsetStr);
    const nowM=new Date().getHours()*60+new Date().getMinutes();
    const pct=Math.max(0,Math.min(1,(nowM-srM)/(ssM-srM)));
    document.getElementById('sunArcFill').style.width=(pct*100)+'%';
    document.getElementById('sunDot').style.left=(pct*100)+'%';
    const dl=ssM-srM;
    document.getElementById('daylightHrs').textContent=`${Math.floor(dl/60)}h ${dl%60}m`;
    applyDayNight(sunriseStr,sunsetStr);
}

/* ══════════════════════════════════════════
   MOON
══════════════════════════════════════════ */
const MOON_MAP={
    'New Moon':'🌑','Waxing Crescent':'🌒','First Quarter':'🌓','Waxing Gibbous':'🌔',
    'Full Moon':'🌕','Waning Gibbous':'🌖','Last Quarter':'🌗','Waning Crescent':'🌘'
};
function moonEmoji(p){ return (MOON_MAP[p]||'🌙')+' '+p.split(' ').map(w=>w[0]).join(''); }

/* ══════════════════════════════════════════
   ARC GAUGES
══════════════════════════════════════════ */
function setArc(pathId,labelId,val,max,lbl){
    const off=141.4-Math.min(val/max,1)*141.4;
    const p=document.getElementById(pathId), l=document.getElementById(labelId);
    if(p) p.style.strokeDashoffset=off;
    if(l) l.textContent=lbl;
}

/* ══════════════════════════════════════════
   UV BAR
══════════════════════════════════════════ */
function updateUV(uv){
    document.getElementById('uvFill').style.left=`calc(${Math.min(uv/12,1)*100}% - 7px)`;
    let risk=t('uv_low'),color='#00c851';
    if(uv>=3&&uv<6){risk=t('uv_mod');color='#ffeb3b';}
    if(uv>=6&&uv<8){risk=t('uv_high');color='#ff9800';}
    if(uv>=8&&uv<11){risk=t('uv_vhigh');color='#f44336';}
    if(uv>=11){risk=t('uv_ext');color='#b71c1c';}
    document.getElementById('uvRiskText').textContent=risk;
    document.getElementById('uvRiskText').style.color=color;
}

/* ══════════════════════════════════════════
   COMFORT
══════════════════════════════════════════ */
function updateComfort(t_c,h){
    const ts=100-Math.abs(t_c-22)*3.5, hs=100-Math.abs(h-45)*1.2;
    const c=Math.max(0,Math.min(100,ts*.6+hs*.4));
    document.getElementById('comfort-dot').style.left=`calc(${c}% - 7px)`;
    let lbl=t('c_harsh'),col='#f44336';
    if(c>=20&&c<40){lbl=t('c_poor');col='#ff9800';}
    if(c>=40&&c<60){lbl=t('c_fair');col='#ffeb3b';}
    if(c>=60&&c<80){lbl=t('c_good');col='#00c851';}
    if(c>=80){lbl=t('c_ideal')+' ✨';col='#2e9aff';}
    document.getElementById('comfort-text').textContent=lbl;
    document.getElementById('comfort-text').style.color=col;
}

/* ══════════════════════════════════════════
   COMPASS
══════════════════════════════════════════ */
const DIR_MAP={N:0,NNE:22,NE:45,ENE:67,E:90,ESE:112,SE:135,SSE:157,S:180,SSW:202,SW:225,WSW:247,W:270,WNW:292,NW:315,NNW:337};
function rotateCompass(dir,wind_kph){
    document.getElementById('compassNeedle').style.transform=`rotate(${DIR_MAP[dir]??0}deg)`;
    document.getElementById('windDirLabel').textContent=dir;
    document.getElementById('windSpeedLabel').textContent=dispWind(wind_kph);
}

/* ══════════════════════════════════════════
   AQI
══════════════════════════════════════════ */
function updateAQI(data){
    const c=data.current;
    const raw=Math.min(300,Math.round((c.cloud*1.2)+(c.humidity*0.8)-(c.wind_kph*1.5)+30));
    const aqi=Math.max(10,raw);
    let lbl='Good',col='#00e676';
    if(aqi>=51&&aqi<101){lbl='Moderate';col='#ffeb3b';}
    if(aqi>=101&&aqi<151){lbl='Unhealthy (SG)';col='#ff9800';}
    if(aqi>=151&&aqi<201){lbl='Unhealthy';col='#f44336';}
    if(aqi>=201){lbl='Hazardous';col='#b71c1c';}
    const pct=Math.min(aqi/300,1)*100;
    document.getElementById('aqi-score').textContent=aqi;
    document.getElementById('aqi-score').style.color=col;
    document.getElementById('aqi-bar-fill').style.left=`calc(${pct}% - 6px)`;
    document.getElementById('aqi-text').textContent=lbl;
    document.getElementById('aqi-text').style.color=col;
    return aqi;
}

/* ══════════════════════════════════════════
   SOFT NOTIFICATION
══════════════════════════════════════════ */
let notifTimer=null;
function showNotif(msg, type='info'){
    const bar=document.getElementById('notif-bar');
    const icons={info:'ℹ️',warn:'⚠️',crit:'🚨'};
    document.getElementById('notif-icon').textContent=icons[type]||'ℹ️';
    document.getElementById('notif-text').textContent=msg;
    bar.className='notif-bar notif-'+type;
    clearTimeout(notifTimer);
    notifTimer=setTimeout(closeNotif, type==='crit'?8000:5000);
    // Add to alert history
    alertHistory.unshift({ msg, type, time: new Date().toLocaleTimeString() });
    if(alertHistory.length>5) alertHistory.pop();
}
function closeNotif(){
    document.getElementById('notif-bar').classList.add('hidden');
}

function checkSevere(condCode, temp_c){
    if(condCode>=1273&&condCode<=1282) showNotif('Thunderstorm detected — stay indoors if possible.','crit');
    else if(condCode>=1225&&condCode<=1264) showNotif('Heavy snow / blizzard — roads may be hazardous.','warn');
    else if(condCode>=1192&&condCode<=1222) showNotif('Heavy rain — drive carefully, watch for flooding.','warn');
    else if(temp_c>=42) showNotif('Extreme heat ('+Math.round(temp_c)+'°C) — stay hydrated.','warn');
    else if(temp_c<=0)  showNotif('Freezing temperatures — dress warmly.','info');
}

/* ══════════════════════════════════════════
   ADVISORY TEXT
══════════════════════════════════════════ */
function getAdvisory(code, temp, uv){
    if(code>=1273) return "⚡ Thunderstorm — stay indoors, avoid open areas.";
    if(code>=1180) return "🌧 Rain expected — keep an umbrella handy.";
    if(code>=1066&&code<1180) return "❄️ Snow or sleet — roads may be slippery.";
    if(code===1135||code===1147) return "🌫 Foggy — reduce speed and use fog lights.";
    if(temp>=38) return "☀️ Hot day ahead — stay hydrated and limit sun exposure.";
    if(temp<=5) return "🧣 Cold weather — layer up before heading out.";
    if(uv>=6) return "🌞 High UV — apply SPF 50+ sunscreen today.";
    return "✅ Conditions are clear — all good to go.";
}

/* ══════════════════════════════════════════
   URDU SUMMARY (multilang condition)
══════════════════════════════════════════ */
const CONDITION_I18N = {
    en: { thunder:'Thunderstorm',heavyrain:'Heavy Rain',drizzle:'Drizzle',snow:'Snowfall',fog:'Foggy',mist:'Misty',cloudy:'Overcast',partcloud:'Partly Cloudy',sunny:'Clear & Sunny',normal:'Normal Conditions' },
    ur: { thunder:'گرج چمک کے ساتھ طوفان',heavyrain:'بارش ہو رہی ہے',drizzle:'ہلکی پھوار',snow:'برف باری',fog:'دھند',mist:'ہلکا بادل',cloudy:'ابر آلود',partcloud:'جزوی ابر',sunny:'صاف اور دھوپ',normal:'موسم معمول کے مطابق' },
    es: { thunder:'Tormenta eléctrica',heavyrain:'Lluvia intensa',drizzle:'Llovizna',snow:'Nevada',fog:'Niebla',mist:'Neblina',cloudy:'Nublado',partcloud:'Parcialmente nublado',sunny:'Despejado y soleado',normal:'Condiciones normales' },
    hi: { thunder:'आंधी तूफान',heavyrain:'भारी बारिश',drizzle:'बूंदाबांदी',snow:'हिमपात',fog:'कोहरा',mist:'धुंध',cloudy:'बादल छाए',partcloud:'आंशिक बादल',sunny:'साफ और धूप',normal:'सामान्य स्थिति' },
    de: { thunder:'Gewitter',heavyrain:'Starkregen',drizzle:'Nieselregen',snow:'Schneefall',fog:'Nebel',mist:'Dunst',cloudy:'Bedeckt',partcloud:'Teils bewölkt',sunny:'Klar und sonnig',normal:'Normale Bedingungen' },
};
function conditionLabel(code){
    const lang = currentLang;
    const map = CONDITION_I18N[lang]||CONDITION_I18N.en;
    if(code>=1273) return map.thunder;
    if(code>=1180) return map.heavyrain;
    if(code>=1150) return map.drizzle;
    if(code>=1066&&code<1150) return map.snow;
    if(code===1135||code===1147) return map.fog;
    if(code===1030||code===1063) return map.mist;
    if(code>=1006) return map.cloudy;
    if(code===1003) return map.partcloud;
    if(code===1000) return map.sunny;
    return map.normal;
}

/* ══════════════════════════════════════════
   ICON
══════════════════════════════════════════ */
function getIcon(code){
    if(code>=1273) return 'cloud-lightning';
    if(code>=1180) return 'cloud-rain';
    if(code>=1150) return 'cloud-drizzle';
    if(code>=1066&&code<1150) return 'snowflake';
    if(code===1135||code===1147) return 'cloud-fog';
    if(code>=1006) return 'cloud';
    if(code===1003) return 'cloud-sun';
    return 'sun';
}

/* ══════════════════════════════════════════
   ★ NEW: WEATHER MOOD RING
══════════════════════════════════════════ */
function updateMoodRing(code, temp_c, humidity){
    const ring = document.getElementById('mood-ring');
    const emoji = document.getElementById('mood-emoji');
    const label = document.getElementById('mood-label');
    if(!ring) return;
    let em='🌤', lbl='Pleasant', color1='#2e9aff', color2='#60a5fa';
    if(code>=1273){ em='⛈'; lbl='Dramatic'; color1='#6366f1'; color2='#a78bfa'; }
    else if(code>=1180){ em='🌧'; lbl='Melancholic'; color1='#0ea5e9'; color2='#7dd3fc'; }
    else if(code>=1150){ em='🌦'; lbl='Gloomy'; color1='#64748b'; color2='#94a3b8'; }
    else if(code>=1066&&code<1150){ em='❄️'; lbl='Serene'; color1='#bae6fd'; color2='#e0f2fe'; }
    else if(code===1135||code===1147){ em='🌫'; lbl='Mysterious'; color1='#6b7280'; color2='#9ca3af'; }
    else if(code>=1006){ em='☁️'; lbl='Calm'; color1='#475569'; color2='#64748b'; }
    else if(temp_c>=35){ em='🔥'; lbl='Scorching'; color1='#ef4444'; color2='#f97316'; }
    else if(temp_c>=25){ em='☀️'; lbl='Sunny'; color1='#f59e0b'; color2='#fbbf24'; }
    else if(temp_c>=15){ em='🌤'; lbl='Pleasant'; color1='#10b981'; color2='#34d399'; }
    else if(temp_c>=5){ em='🍂'; lbl='Crisp'; color1='#d97706'; color2='#f59e0b'; }
    else{ em='🥶'; lbl='Freezing'; color1='#93c5fd'; color2='#dbeafe'; }
    ring.style.background=`radial-gradient(circle at center, ${color1}22, ${color2}11), conic-gradient(${color1}, ${color2}, ${color1})`;
    ring.style.boxShadow=`0 0 30px ${color1}44, 0 0 60px ${color1}22`;
    emoji.textContent=em;
    label.textContent=lbl;
}

/* ══════════════════════════════════════════
   ★ NEW: REAL FEEL THERMOMETER
══════════════════════════════════════════ */
function updateThermometer(feelslike_c){
    const wrap = document.getElementById('thermo-fill');
    const txt = document.getElementById('thermo-text');
    if(!wrap) return;
    // map -10..45 to 0..100%
    const pct = Math.max(0, Math.min(100, ((feelslike_c+10)/55)*100));
    wrap.style.width = pct+'%';
    let color='#60a5fa', lbl='Cold';
    if(feelslike_c>45){color='#b91c1c';lbl='Extreme Heat';}
    else if(feelslike_c>35){color='#ef4444';lbl='Very Hot';}
    else if(feelslike_c>28){color='#f97316';lbl='Hot';}
    else if(feelslike_c>22){color='#f59e0b';lbl='Warm';}
    else if(feelslike_c>15){color='#10b981';lbl='Comfortable';}
    else if(feelslike_c>5){color='#60a5fa';lbl='Cool';}
    else if(feelslike_c>-5){color='#93c5fd';lbl='Cold';}
    else{color='#bae6fd';lbl='Freezing';}
    wrap.style.background=`linear-gradient(90deg, #60a5fa, ${color})`;
    wrap.style.boxShadow=`0 0 8px ${color}88`;
    if(txt) txt.textContent=`${dispTemp(feelslike_c)}${unitSuffix()} · ${lbl}`;
}

/* ══════════════════════════════════════════
   ★ NEW: WIND SPEED METER (BEAUFORT)
══════════════════════════════════════════ */
function updateWindMeter(wind_kph){
    const container = document.getElementById('wind-bars');
    const bfEl = document.getElementById('beaufort-val');
    if(!container) return;
    // Beaufort scale
    const bf = [0,1.1,5.6,12,20,29,39,50,62,75,89,103,117];
    let beaufort=0;
    bf.forEach((v,i)=>{ if(wind_kph>=v) beaufort=i; });
    const bfNames=['Calm','Light Air','Light Breeze','Gentle Breeze','Moderate Breeze','Fresh Breeze','Strong Breeze','High Wind','Gale','Strong Gale','Storm','Violent Storm','Hurricane'];
    if(bfEl) bfEl.textContent=`${beaufort} — ${bfNames[beaufort]}`;
    container.innerHTML='';
    for(let i=0;i<12;i++){
        const bar=document.createElement('div');
        bar.className='wm-bar';
        const h = (i+1)*8;
        const active = i<=beaufort;
        const col = i<=3?'#10b981':i<=6?'#f59e0b':i<=9?'#f97316':'#ef4444';
        bar.style.cssText=`height:${h}px;background:${active?col:'rgba(255,255,255,0.07)'};transition:all ${0.1+i*0.05}s ease;box-shadow:${active?`0 0 6px ${col}66`:''};`;
        container.appendChild(bar);
    }
}

/* ══════════════════════════════════════════
   ★ NEW: AIR BREATHABILITY
══════════════════════════════════════════ */
function updateBreathability(aqi, humidity, wind_kph){
    const circle = document.getElementById('breathe-circle');
    const pctEl = document.getElementById('breathe-pct');
    const label = document.getElementById('breathe-label');
    const desc = document.getElementById('breathe-desc');
    if(!circle) return;
    // Higher score = better air
    const score = Math.max(0, Math.min(100, 100 - (aqi/3) - (humidity>80?10:0) + (wind_kph>20?5:0)));
    const pct = score/100;
    circle.style.strokeDashoffset = 251 - pct*251;
    let col='#00e676', lbl='Excellent', d='Air is fresh and clean.';
    if(score<80){col='#a3e635';lbl='Good';d='Good air, fine for outdoor activities.';}
    if(score<60){col='#fbbf24';lbl='Moderate';d='Acceptable for most, sensitive groups take care.';}
    if(score<40){col='#f97316';lbl='Poor';d='Limit prolonged outdoor exertion.';}
    if(score<20){col='#ef4444';lbl='Unhealthy';d='Avoid outdoor activities if possible.';}
    circle.style.stroke = col;
    if(pctEl) pctEl.textContent=Math.round(score)+'%';
    if(pctEl) pctEl.style.color=col;
    if(label){ label.textContent=lbl; label.style.color=col; }
    if(desc) desc.textContent=d;
}

/* ══════════════════════════════════════════
   ★ NEW: PRECIPITATION TIMELINE
══════════════════════════════════════════ */
function buildPrecipTimeline(forecastdays){
    const wrap = document.getElementById('precip-timeline-wrap');
    const tl = document.getElementById('precip-timeline');
    if(!tl||!wrap) return;
    tl.innerHTML='';
    const maxRain = Math.max(...forecastdays.map(d=>d.day.totalprecip_mm), 0.1);
    forecastdays.forEach((day,i)=>{
        const d=new Date(day.date+'T12:00:00');
        const name=i===0?'Today':d.toLocaleDateString('en',{weekday:'short'});
        const mm=day.day.totalprecip_mm;
        const pct=(mm/maxRain)*100;
        const col=mm>20?'#2e9aff':mm>5?'#60a5fa':'#93c5fd';
        const item=document.createElement('div');
        item.className='precip-item';
        item.innerHTML=`
            <span class="precip-day">${name}</span>
            <div class="precip-bar-wrap">
                <div class="precip-bar-fill" style="width:${pct}%;background:${col};box-shadow:0 0 6px ${col}66;"></div>
            </div>
            <span class="precip-mm">${mm.toFixed(1)}mm</span>
        `;
        tl.appendChild(item);
    });
    wrap.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   ★ NEW: WORLD CITIES TICKER
══════════════════════════════════════════ */
const WORLD_CITIES = ['New York', 'London', 'Dubai', 'Tokyo', 'Paris', 'Sydney'];
async function loadCityTicker(){
    const ticker = document.getElementById('city-ticker');
    if(!ticker) return;
    try{
        const results = await Promise.allSettled(
            WORLD_CITIES.map(city=>
                fetch(`https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${encodeURIComponent(city)}`).then(r=>r.json())
            )
        );
        ticker.innerHTML='';
        results.forEach((r,i)=>{
            if(r.status!=='fulfilled') return;
            const d=r.value;
            const item=document.createElement('div');
            item.className='ticker-item';
            item.innerHTML=`
                <span class="ticker-city">${d.location.name}</span>
                <span class="ticker-temp" style="color:var(--accent)">${dispTemp(d.current.temp_c)}${unitSuffix()}</span>
                <span class="ticker-cond">${d.current.condition.text}</span>
            `;
            ticker.appendChild(item);
        });
    }catch(e){
        if(ticker) ticker.innerHTML='<span style="color:var(--dim);font-size:11px;">Could not load cities</span>';
    }
}

/* ══════════════════════════════════════════
   ★ NEW: ACTIVITY RECOMMENDER
══════════════════════════════════════════ */
function buildActivityCard(code, temp_c, wind_kph, uv){
    const card = document.getElementById('activity-card');
    const list = document.getElementById('activity-list');
    if(!card||!list) return;
    const activities=[];
    if(code===1000||(code===1003&&temp_c>=20&&temp_c<=32&&uv<8)){
        activities.push({e:'🏃',t:'Running / Jogging'},{e:'🚴',t:'Cycling'},{e:'🏸',t:'Badminton'},{e:'📸',t:'Photography'});
    }
    if(code>=1180){ activities.push({e:'📚',t:'Indoor Reading'},{e:'🎮',t:'Gaming'},{e:'🍲',t:'Cook something warm'}); }
    if(code>=1273){ activities.push({e:'🎬',t:'Movie Marathon'},{e:'🧘',t:'Yoga Indoors'}); }
    if(temp_c>=30&&code<1180){ activities.push({e:'🏊',t:'Swimming'},{e:'🧃',t:'Stay Hydrated'}); }
    if(temp_c<=10){ activities.push({e:'☕',t:'Hot Beverages'},{e:'🧣',t:'Layer Up & Walk'}); }
    if(code>=1066&&code<1150){ activities.push({e:'⛷️',t:'Winter Sports'},{e:'☃️',t:'Build a Snowman'}); }
    if(activities.length===0) activities.push({e:'🌤',t:'Any outdoor activity!'},{e:'🚶',t:'A nice walk'});
    list.innerHTML=activities.slice(0,6).map(a=>`<div class="activity-item"><span>${a.e}</span>${a.t}</div>`).join('');
    card.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   ★ NEW: ALERT HISTORY
══════════════════════════════════════════ */
function renderAlertHistory(){
    const card = document.getElementById('alert-history-card');
    const list = document.getElementById('alert-history-list');
    if(!card||!list) return;
    if(alertHistory.length===0){ card.classList.add('hidden'); return; }
    const icons={info:'ℹ️',warn:'⚠️',crit:'🚨'};
    list.innerHTML=alertHistory.map(a=>`
        <div class="alert-item alert-${a.type}">
            <span>${icons[a.type]||'ℹ️'}</span>
            <div class="alert-body">
                <span class="alert-msg">${a.msg}</span>
                <span class="alert-time">${a.time}</span>
            </div>
        </div>
    `).join('');
    card.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   ★ NEW: OUTDOOR PLANNER
══════════════════════════════════════════ */
function buildPlanner(forecastdays){
    const card = document.getElementById('planner-card');
    const grid = document.getElementById('planner-grid');
    if(!card||!grid) return;
    grid.innerHTML='';
    forecastdays.slice(0,7).forEach((day,i)=>{
        const d=new Date(day.date+'T12:00:00');
        const name=i===0?'Today':d.toLocaleDateString('en',{weekday:'short'});
        const code=day.day.condition.code;
        const rain=day.day.daily_chance_of_rain;
        let verdict='✅', col='#10b981';
        if(rain>=60||code>=1180){ verdict='🌧'; col='#60a5fa'; }
        if(code>=1273){ verdict='⛈'; col='#6366f1'; }
        if(code>=1066&&code<1150){ verdict='❄️'; col='#93c5fd'; }
        const item=document.createElement('div');
        item.className='planner-item';
        item.style.borderColor=col+'44';
        item.innerHTML=`
            <span class="plan-day">${name}</span>
            <span class="plan-verdict" style="color:${col}">${verdict}</span>
            <span class="plan-rain" style="color:var(--dim)">${rain}%</span>
        `;
        grid.appendChild(item);
    });
    card.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   ★ NEW: FEELS LIKE VS ACTUAL CHART
══════════════════════════════════════════ */
function buildFeelRealChart(forecastdays){
    const card = document.getElementById('feel-real-card');
    const canvas = document.getElementById('feelRealChart');
    if(!card||!canvas) return;
    const labels=[], actual=[], feels=[];
    forecastdays.forEach((day,i)=>{
        const d=new Date(day.date+'T12:00:00');
        labels.push(i===0?'Today':d.toLocaleDateString('en',{weekday:'short'}));
        actual.push(day.day.avgtemp_c);
        // approximate feels like from hourly noon
        const noon=day.hour?.find(h=>new Date(h.time).getHours()===12);
        feels.push(noon?noon.feelslike_c:day.day.avgtemp_c);
    });
    const ctx=canvas.getContext('2d');
    if(feelRealChart) feelRealChart.destroy();
    feelRealChart=new Chart(ctx,{
        type:'line',
        data:{
            labels,
            datasets:[
                {label:'Actual',data:actual,borderColor:'#f59e0b',borderWidth:2,tension:.4,pointRadius:3,pointBackgroundColor:'#f59e0b',fill:false},
                {label:'Feels Like',data:feels,borderColor:'#60a5fa',borderWidth:2,tension:.4,pointRadius:3,pointBackgroundColor:'#60a5fa',borderDash:[4,3],fill:false}
            ]
        },
        options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:true,labels:{color:'rgba(148,163,184,0.7)',font:{size:9},boxWidth:12}},tooltip:{backgroundColor:'rgba(7,9,36,0.95)',borderColor:'rgba(46,154,255,0.3)',borderWidth:1,titleColor:'#94a3b8',bodyColor:'#fcfcff',padding:8,cornerRadius:8}},
            scales:{x:{display:false},y:{display:false}}
        }
    });
    card.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   SECTION FOLDERS (toggle)
══════════════════════════════════════════ */
const openSections = new Set(['sec-current','sec-wind','sec-forecast','sec-map','sec-compare','sec-smart']);

function toggleSection(id){
    const body = document.getElementById(id);
    const iconId = 'fold-'+id.replace('sec-','');
    const icon = document.getElementById(iconId);
    if(!body) return;
    if(openSections.has(id)){
        openSections.delete(id);
        body.style.maxHeight = body.scrollHeight+'px';
        requestAnimationFrame(()=>{ body.style.maxHeight='0'; body.style.overflow='hidden'; });
        if(icon) icon.style.transform='rotate(-90deg)';
    } else {
        openSections.add(id);
        body.style.maxHeight = body.scrollHeight+'px';
        body.addEventListener('transitionend',()=>{ if(openSections.has(id)) body.style.maxHeight=''; },{ once:true });
        body.style.overflow='';
        if(icon) icon.style.transform='rotate(0deg)';
    }
}

/* ══════════════════════════════════════════
   TRIVIA
══════════════════════════════════════════ */
const TRIVIA=[
    "Lightning strikes Earth about 100 times every second — that's 8 million bolts per day.",
    "A single hurricane releases the same energy as 10,000 nuclear bombs over its lifetime.",
    "The highest temperature ever recorded was 56.7°C in Death Valley, California (1913).",
    "The coldest naturally occurring temperature on Earth was −89.2°C in Antarctica.",
    "Rain doesn't actually fall in teardrop shapes — small drops are nearly spherical.",
    "A snowstorm requires three things: cold air, moisture, and a lifting mechanism.",
    "The smell of rain has a name: petrichor — it's released when rain hits dry soil.",
    "Fog is simply a cloud at ground level — both are made of tiny suspended water droplets.",
    "Winds on Neptune can reach 2,100 km/h — the fastest in the solar system.",
    "The wettest place on Earth is Mawsynram, India — it receives ~11,871 mm of rain per year.",
    "A bolt of lightning is about 5× hotter than the surface of the sun at ~30,000 Kelvin.",
    "Hail can fall at up to 160 km/h — large hailstones have killed people and livestock.",
];
let triviaPool=[...TRIVIA];
function nextTrivia(){
    triviaIndex=(triviaIndex+1)%triviaPool.length;
    document.getElementById('trivia-text').textContent=triviaPool[triviaIndex];
}

/* ══════════════════════════════════════════
   PACKING
══════════════════════════════════════════ */
function buildPacking(code, temp_c, wind_kph, humidity){
    const items=[];
    if(code>=1180) items.push({e:'☂️',t:'Umbrella'},{e:'🧥',t:'Raincoat'});
    if(code>=1066&&code<1150) items.push({e:'🧤',t:'Gloves'},{e:'🧣',t:'Scarf'},{e:'👢',t:'Snow Boots'});
    if(temp_c>=30) items.push({e:'🕶️',t:'Sunglasses'},{e:'🧴',t:'Sunscreen'},{e:'💧',t:'Water Bottle'});
    if(temp_c<=15) items.push({e:'🧥',t:'Jacket'},{e:'🧣',t:'Scarf'});
    if(wind_kph>=40) items.push({e:'🧢',t:'Hat / Cap'});
    if(code===1000||(code===1003&&temp_c>=25)) items.push({e:'😎',t:'Shades'},{e:'🧴',t:'Sunscreen'});
    if(humidity>=80) items.push({e:'👕',t:'Light Breathable Clothes'});
    if(items.length===0) items.push({e:'✅',t:'Nothing extra — you\'re good!'});
    const wrap=document.getElementById('packing-items');
    wrap.innerHTML=items.map(i=>`<div class="pack-item"><span>${i.e}</span>${i.t}</div>`).join('');
    document.getElementById('packing-card').classList.remove('hidden');
}

/* ══════════════════════════════════════════
   WEATHER SCORE
══════════════════════════════════════════ */
function updateScore(temp_c, humidity, wind_kph, condCode, uv){
    let s=100;
    const td=Math.abs(temp_c-23);
    s-=Math.min(td*2,30);
    const hd=Math.abs(humidity-50);
    s-=Math.min(hd*0.3,15);
    if(wind_kph>40) s-=10;
    if(wind_kph>70) s-=10;
    if(condCode>=1180&&condCode<1273) s-=20;
    if(condCode>=1273) s-=35;
    if(condCode>=1066&&condCode<1150) s-=15;
    if(uv>=8) s-=10;
    const score=Math.max(0,Math.round(s));
    let verdict='Poor', col='#f44336';
    if(score>=40&&score<60){verdict='Okay';col='#ff9800';}
    if(score>=60&&score<75){verdict='Good';col='#ffeb3b';}
    if(score>=75&&score<88){verdict='Great';col='#00c851';}
    if(score>=88){verdict='Perfect ✨';col='#2e9aff';}
    document.getElementById('score-number').textContent=score;
    document.getElementById('score-number').style.color=col;
    document.getElementById('score-verdict').textContent=verdict+' day to go out';
    const circ=201;
    document.getElementById('score-ring').style.strokeDashoffset=circ-(score/100)*circ;
    document.getElementById('score-ring').style.stroke=col;
    document.getElementById('score-card').classList.remove('hidden');
}

/* ══════════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════════ */
function updateCountdown(forecastdays){
    const now=new Date();
    const dayOfWeek=now.getDay();
    const daysToSat=dayOfWeek===6?7:(6-dayOfWeek);
    const daysToSun=dayOfWeek===0?7:(7-dayOfWeek);
    const nearest=Math.min(daysToSat,daysToSun);
    const nearestDay=daysToSat<daysToSun?'Saturday':'Sunday';
    let fcast=null;
    if(forecastdays[nearest-1]){
        const fd=forecastdays[nearest-1];
        fcast=`${dispTemp(fd.day.maxtemp_c)}°/${dispTemp(fd.day.mintemp_c)}° · ${fd.day.condition.text}`;
    }
    const el=document.getElementById('countdown-content');
    el.innerHTML=`
        <span class="cd-label">Next Weekend Day</span>
        <strong>${nearest}</strong>
        <span class="cd-label">${nearest===1?'Tomorrow':'days until'} ${nearestDay}</span>
        ${fcast?`<span style="font-size:11px;margin-top:4px;display:block;">${fcast}</span>`:''}
    `;
}

/* ══════════════════════════════════════════
   COMPARE CITY
══════════════════════════════════════════ */
async function compareCity(){
    const input=document.getElementById('compareCity').value.trim();
    if(!input||!lastData) return;
    const result=document.getElementById('compare-result');
    result.innerHTML='<span style="color:var(--dim)">Fetching...</span>';
    result.classList.remove('hidden');
    try{
        const res=await fetch(`https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${encodeURIComponent(input)}`);
        if(!res.ok) throw new Error('not found');
        const d=await res.json();
        const c1=lastData.current, c2=d.current;
        const n1=lastData.location.name, n2=d.location.name;
        const tempDiff=Math.round(c1.temp_c-c2.temp_c);
        const diffStr=tempDiff>0?`<strong>${n1}</strong> is ${tempDiff}° warmer`
                     :tempDiff<0?`<strong>${n1}</strong> is ${Math.abs(tempDiff)}° cooler`
                     :'Both cities are the same temperature';
        result.innerHTML=`
            <div style="display:flex;gap:12px;margin-bottom:8px;">
                <div style="flex:1;text-align:center;">
                    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--dim)">${n1}</div>
                    <div style="font-size:22px;font-weight:900;color:var(--primary)">${dispTemp(c1.temp_c)}${unitSuffix()}</div>
                    <div style="font-size:10px;color:var(--dim)">${c1.condition.text}</div>
                </div>
                <div style="width:1px;background:var(--border);"></div>
                <div style="flex:1;text-align:center;">
                    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--dim)">${n2}</div>
                    <div style="font-size:22px;font-weight:900;color:var(--accent)">${dispTemp(c2.temp_c)}${unitSuffix()}</div>
                    <div style="font-size:10px;color:var(--dim)">${c2.condition.text}</div>
                </div>
            </div>
            <div style="font-size:11px;text-align:center;color:var(--dim)">${diffStr}</div>
            <div style="font-size:10px;margin-top:6px;color:var(--dim)">
                💧 Humidity: <strong style="color:var(--primary)">${c1.humidity}%</strong> vs <strong style="color:var(--accent)">${c2.humidity}%</strong> &nbsp;|&nbsp;
                💨 Wind: <strong style="color:var(--primary)">${dispWind(c1.wind_kph)}</strong> vs <strong style="color:var(--accent)">${dispWind(c2.wind_kph)}</strong>
            </div>
        `;
    }catch(e){
        result.innerHTML='<span style="color:#f87171">City not found — check spelling.</span>';
    }
}

document.getElementById('compareCity').addEventListener('keydown',e=>{
    if(e.key==='Enter') compareCity();
});

/* ══════════════════════════════════════════
   MAP LAYERS
══════════════════════════════════════════ */
function switchMapLayer(layer, btn){
    currentMapLayer=layer;
    document.querySelectorAll('.ml-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(currentLat&&currentLon) loadMap(currentLat,currentLon,layer);
}
function loadMap(lat,lon,layer){
    const iframe=document.getElementById('windyMap');
    const loading=document.getElementById('map-loading');
    loading.style.display='flex';
    iframe.src=`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=7&level=surface&overlay=${layer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
    iframe.onload=()=>{ loading.style.display='none'; };
}

/* ══════════════════════════════════════════
   BOOKMARKS
══════════════════════════════════════════ */
function toggleBookmark(){
    if(!lastData) return;
    const city=lastData.location.name;
    const i=bookmarks.indexOf(city);
    if(i===-1) bookmarks.push(city);
    else bookmarks.splice(i,1);
    try{ localStorage.setItem('aura_bm',JSON.stringify(bookmarks)); }catch(e){}
    renderBookmarks(); updateBmButton(city);
}
function renderBookmarks(){
    const bar=document.getElementById('bookmarks-bar');
    bar.innerHTML='';
    bookmarks.forEach(city=>{
        const c=document.createElement('div'); c.className='bm-chip';
        c.innerHTML=`<span onclick="fetchWeather('${city.replace(/'/g,"\\'")}')">📍 ${city}</span><span class="bm-x" onclick="removeBm('${city.replace(/'/g,"\\'")}')">✕</span>`;
        bar.appendChild(c);
    });
}
function removeBm(city){
    bookmarks=bookmarks.filter(b=>b!==city);
    try{ localStorage.setItem('aura_bm',JSON.stringify(bookmarks)); }catch(e){}
    renderBookmarks();
    if(lastData&&lastData.location.name===city) updateBmButton(city);
}
function updateBmButton(cityName){
    const bm=bookmarks.includes(cityName);
    const btn=document.getElementById('bookmark-btn');
    btn.classList.toggle('bookmarked',bm);
    document.getElementById('bookmark-icon').setAttribute('data-lucide', bm?'bookmark-check':'bookmark');
    lucide.createIcons();
}

/* ══════════════════════════════════════════
   SHARE (FIXED)
══════════════════════════════════════════ */
function shareWeather(){
    if(!lastData) return;
    const c=lastData.current, l=lastData.location, a=lastData.forecast.forecastday[0].astro;
    const txt=`🌍 ${l.name}, ${l.country}\n🌡 ${dispTemp(c.temp_c)}${unitSuffix()} · ${c.condition.text}\n💧 Humidity: ${c.humidity}%  💨 Wind: ${dispWind(c.wind_kph)}\n🌅 ${a.sunrise}  🌇 ${a.sunset}\n\n— AURA ETHEREAL v6`;
    if(navigator.share && /Mobi|Android/i.test(navigator.userAgent)){
        navigator.share({title:'Weather from AURA ETHEREAL',text:txt}).catch(()=>copyFallback(txt));
        return;
    }
    copyFallback(txt);
}
function copyFallback(txt){
    if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(()=>{
            const s=document.getElementById('share-snack');
            s.classList.remove('hidden');
            setTimeout(()=>s.classList.add('hidden'),2500);
        }).catch(()=>legacyCopy(txt));
    } else {
        legacyCopy(txt);
    }
}
function legacyCopy(txt){
    const ta=document.createElement('textarea');
    ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    const s=document.getElementById('share-snack');
    s.classList.remove('hidden');
    setTimeout(()=>s.classList.add('hidden'),2500);
}

/* ══════════════════════════════════════════
   HOURLY TOGGLE
══════════════════════════════════════════ */
function switchHourly(mode){
    hourlyMode=mode;
    document.getElementById('pill-temp').classList.toggle('active',mode==='temp');
    document.getElementById('pill-rain').classList.toggle('active',mode==='rain');
    if(lastData) buildHourly(lastData);
}
function buildHourly(data){
    const grid=document.getElementById('hourlyGrid');
    grid.innerHTML='';
    const now=new Date();
    const today=data.forecast.forecastday[0];
    const all=[...today.hour,...(data.forecast.forecastday[1]?data.forecast.forecastday[1].hour:[])];
    let count=0;
    all.forEach(h=>{
        if(count>=24) return;
        const hd=new Date(h.time);
        if(hd<now-3600000) return;
        count++;
        const isNow=Math.abs(hd-now)<3600000;
        const tStr=hd.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',hour12:true});
        const card=document.createElement('div');
        card.className='h-card'+(isNow?' h-now':'');
        if(hourlyMode==='temp'){
            card.innerHTML=`
                <p>${isNow?'Now':tStr}</p>
                <i data-lucide="${getIcon(h.condition.code)}" class="hc-icon" style="width:16px;height:16px;"></i>
                <strong>${dispTemp(h.temp_c)}°</strong>
                <span class="rain-pct">💧${h.chance_of_rain}%</span>
            `;
        } else {
            const rp=h.chance_of_rain;
            card.innerHTML=`
                <p>${isNow?'Now':tStr}</p>
                <strong style="color:#60a5fa">${rp}%</strong>
                <div class="rain-bar"><div class="rain-bar-fill" style="width:${rp}%"></div></div>
                <span class="rain-pct">${h.precip_mm}mm</span>
            `;
        }
        grid.appendChild(card);
    });
    lucide.createIcons();
    enableDrag(grid);
}

/* ══════════════════════════════════════════
   7-DAY CHART
══════════════════════════════════════════ */
function createChart(labels, temps, days){
    const ctx=document.getElementById('tempChart').getContext('2d');
    if(tempChart) tempChart.destroy();
    const grad=ctx.createLinearGradient(0,0,0,90);
    grad.addColorStop(0,'rgba(46,154,255,0.28)');
    grad.addColorStop(1,'rgba(46,154,255,0)');
    tempChart=new Chart(ctx,{
        type:'line',
        data:{
            labels,
            datasets:[{
                data:temps,borderColor:'#2e9aff',borderWidth:2,tension:.45,
                pointRadius:4,pointBackgroundColor:'#2e9aff',pointBorderColor:'transparent',
                pointHoverRadius:6,pointHoverBackgroundColor:'#fff',
                fill:true,backgroundColor:grad
            }]
        },
        options:{
            responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false},tooltip:{
                callbacks:{label:ctx=>`${dispTemp(temps[ctx.dataIndex])}${unitSuffix()}`},
                backgroundColor:'rgba(7,9,36,0.95)',borderColor:'rgba(46,154,255,0.3)',borderWidth:1,
                titleColor:'#94a3b8',bodyColor:'#fcfcff',padding:10,cornerRadius:10
            }},
            scales:{x:{display:false},y:{display:false}},
            onClick:(e,el)=>{
                if(!el.length) return;
                const idx=el[0].index;
                const d=days[idx];
                if(!d) return;
                const det=document.getElementById('day-detail');
                det.classList.remove('hidden');
                det.innerHTML=`
                    <strong style="color:var(--primary)">${labels[idx]}</strong> · ${d.day.condition.text}<br>
                    🌡 High: <strong style="color:var(--primary)">${dispTemp(d.day.maxtemp_c)}${unitSuffix()}</strong> &nbsp; Low: <strong style="color:var(--primary)">${dispTemp(d.day.mintemp_c)}${unitSuffix()}</strong><br>
                    💧 Rain chance: <strong style="color:#60a5fa">${d.day.daily_chance_of_rain}%</strong> &nbsp; 💨 Max wind: <strong>${dispWind(d.day.maxwind_kph)}</strong><br>
                    ☀️ UV: <strong>${d.day.uv}</strong> &nbsp; 🌅 ${d.astro.sunrise} → ${d.astro.sunset}
                `;
            }
        }
    });
}

/* ══════════════════════════════════════════
   RAIN BAR CHART
══════════════════════════════════════════ */
function buildRainBars(data){
    const wrap=document.getElementById('rain-chart-wrap');
    const bars=document.getElementById('rain-bars');
    bars.innerHTML='';
    const today=data.forecast.forecastday[0];
    const all=[...today.hour,...(data.forecast.forecastday[1]?data.forecast.forecastday[1].hour:[])];
    const now=new Date();
    let shown=0;
    const maxMm=Math.max(...all.map(h=>h.precip_mm),0.1);
    all.forEach(h=>{
        if(shown>=12) return;
        const hd=new Date(h.time);
        if(hd<now-3600000) return;
        shown++;
        const pct=(h.precip_mm/maxMm)*100;
        const tStr=hd.toLocaleTimeString('en',{hour:'2-digit',hour12:true});
        const col=document.createElement('div'); col.className='rain-bar-col';
        col.innerHTML=`<div class="rb" style="height:${Math.max(pct,2)}%"></div><span>${tStr}</span>`;
        bars.appendChild(col);
    });
    wrap.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   VISUAL EFFECTS
══════════════════════════════════════════ */
function handleVisualEffects(code){
    clearInterval(lightningInterval);
    const rc=document.getElementById('atmosphere-visuals');
    const lc=document.getElementById('lightning-container');
    const fog=document.getElementById('fog-overlay');
    rc.innerHTML=''; lc.innerHTML=''; fog.classList.remove('fog-active');
    if(code===1030||code===1135||code===1147){
        fog.classList.add('fog-active'); return;
    }
    const snowCodes=[1066,1114,1117,1210,1213,1216,1219,1222,1225,1255,1258,1279,1282];
    if(snowCodes.includes(code)){
        for(let i=0;i<75;i++){
            const p=document.createElement('div'); p.className='snow-particle';
            const sz=Math.random()*4+2;
            Object.assign(p.style,{left:Math.random()*100+'vw',animationDelay:Math.random()*5+'s',animationDuration:(Math.random()*4+3)+'s',width:sz+'px',height:sz+'px',opacity:(Math.random()*0.4+0.4).toFixed(2)});
            rc.appendChild(p);
        }
        return;
    }
    const rainCodes=[1063,1150,1153,1168,1171,1180,1183,1186,1189,1192,1195,1198,1201,1240,1243,1246];
    const thunderCodes=[1087,1273,1276,1279,1282];
    const isRain=rainCodes.includes(code);
    const isThunder=thunderCodes.some(tc=>code===tc);
    if(isRain||isThunder){
        const heavy=code>=1192||isThunder;
        const count=heavy?140:80;
        for(let i=0;i<count;i++){
            const p=document.createElement('div'); p.className='rain-particle';
            Object.assign(p.style,{left:Math.random()*100+'vw',animationDelay:Math.random()*2+'s',animationDuration:(Math.random()*.4+.35)+'s',height:(Math.random()*14+7)+'px',opacity:(Math.random()*.4+.25).toFixed(2)});
            rc.appendChild(p);
        }
    }
    if(isThunder){
        const fire=()=>{
            for(let b=0;b<Math.floor(Math.random()*2)+1;b++){
                setTimeout(()=>{
                    const bolt=document.createElement('div');
                    bolt.className='lightning-bolt bolt-active';
                    bolt.style.left=(Math.random()*70+10)+'%';
                    bolt.style.top=(Math.random()*8)+'vh';
                    lc.appendChild(bolt);
                    setTimeout(()=>bolt.remove(),600);
                },b*130);
            }
        };
        fire(); lightningInterval=setInterval(fire,Math.random()*4000+2500);
    }
}

/* ══════════════════════════════════════════
   PULL TO REFRESH
══════════════════════════════════════════ */
(function(){
    let sy=0,pulling=false;
    const ind=document.getElementById('pull-indicator');
    document.addEventListener('touchstart',e=>{ if(window.scrollY===0){sy=e.touches[0].clientY;pulling=true;} },{passive:true});
    document.addEventListener('touchmove',e=>{ if(pulling&&e.touches[0].clientY-sy>60) ind.classList.add('visible'); },{passive:true});
    document.addEventListener('touchend',e=>{
        if(!pulling) return; pulling=false;
        const dy=e.changedTouches[0].clientY-sy;
        ind.classList.remove('visible');
        if(dy>80&&lastData) fetchWeather(currentLat&&currentLon?`${currentLat},${currentLon}`:document.getElementById('citySearch').value||'Karachi');
    });
})();

/* ══════════════════════════════════════════
   DRAG SCROLL
══════════════════════════════════════════ */
function enableDrag(el){
    if(!el) return;
    let down=false,sx,sl;
    el.addEventListener('mousedown',e=>{down=true;sx=e.pageX-el.offsetLeft;sl=el.scrollLeft;});
    el.addEventListener('mouseleave',()=>down=false);
    el.addEventListener('mouseup',()=>down=false);
    el.addEventListener('mousemove',e=>{if(!down)return;e.preventDefault();el.scrollLeft=sl-(e.pageX-el.offsetLeft-sx)*1.5;});
}

/* ══════════════════════════════════════════
   AUTOCOMPLETE
══════════════════════════════════════════ */
let acTimer=null;
document.getElementById('citySearch').addEventListener('input',e=>{
    clearTimeout(acTimer);
    const q=e.target.value.trim(), dd=document.getElementById('search-dropdown');
    if(q.length<2){dd.classList.add('dropdown-hidden');return;}
    acTimer=setTimeout(async()=>{
        try{
            const r=await fetch(`https://api.weatherapi.com/v1/search.json?key=${KEY}&q=${encodeURIComponent(q)}`);
            const locs=await r.json();
            if(locs.length){
                dd.innerHTML=locs.map(l=>`<div class="dropdown-item" onclick="selectCity('${l.name.replace(/'/g,"\\'")}')">📍 ${l.name}, ${l.country}</div>`).join('');
                dd.classList.remove('dropdown-hidden');
            } else dd.classList.add('dropdown-hidden');
        }catch{dd.classList.add('dropdown-hidden');}
    },300);
});
function selectCity(city){
    document.getElementById('citySearch').value=city;
    document.getElementById('search-dropdown').classList.add('dropdown-hidden');
    currentLat=null; currentLon=null; fetchWeather(city);
}
document.getElementById('citySearch').addEventListener('keydown',e=>{
    if(e.key==='Enter'){document.getElementById('search-dropdown').classList.add('dropdown-hidden');currentLat=null;currentLon=null;fetchWeather(e.target.value);}
});
document.addEventListener('click',e=>{if(!e.target.closest('.search-input-wrapper')) document.getElementById('search-dropdown').classList.add('dropdown-hidden');});

/* ══════════════════════════════════════════
   GEOLOCATION
══════════════════════════════════════════ */
function getUserLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            p=>{ currentLat=p.coords.latitude; currentLon=p.coords.longitude; fetchWeather(`${currentLat},${currentLon}`); },
            ()=>fetchWeather('Karachi')
        );
    } else fetchWeather('Karachi');
}

/* ══════════════════════════════════════════
   FETCH
══════════════════════════════════════════ */
async function fetchWeather(query){
    if(!query||!query.trim()) return;
    document.getElementById('loader').classList.remove('hidden');
    const sections=['weather-content','wind-air-section','forecast-section','map-section-wrap','compare-section-wrap','smart-section-wrap'];
    sections.forEach(s=>document.getElementById(s)?.classList.add('hidden'));
    document.getElementById('loader').querySelector('span').textContent=t('detecting');
    try{
        const res=await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no`);
        if(!res.ok) throw new Error('API '+res.status);
        lastData=await res.json();
        updateUI(lastData);
    }catch(err){
        document.getElementById('loader').querySelector('span').textContent=t('location_not_found');
        console.error(err);
    }
}

/* ══════════════════════════════════════════
   MAIN UI UPDATE
══════════════════════════════════════════ */
function updateUI(data){
    document.getElementById('loader').classList.add('hidden');
    // Show all sections
    ['weather-content','wind-air-section','forecast-section','map-section-wrap','compare-section-wrap','smart-section-wrap'].forEach(s=>document.getElementById(s)?.classList.remove('hidden'));

    const cur=data.current, loc=data.location, cond=cur.condition;
    const today=data.forecast.forecastday[0], astro=today.astro;
    const code=cond.code;

    currentLat=currentLat||loc.lat; currentLon=currentLon||loc.lon;
    forecastDays=data.forecast.forecastday;

    /* Location */
    document.getElementById('cityName').textContent=loc.name+(loc.country?', '+loc.country:'');
    const ldt=new Date(loc.localtime.replace(' ','T'));
    document.getElementById('localDateTime').textContent=
        ldt.toLocaleDateString(currentLang==='ur'?'ur-PK':'en',{weekday:'long',day:'numeric',month:'short'})+' · '+
        ldt.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    document.getElementById('currentDesc').textContent=cond.text;

    /* Temp */
    document.getElementById('currentTemp').textContent=dispTemp(cur.temp_c);
    document.getElementById('unitLabel').textContent=unitSuffix();

    /* Stats */
    document.getElementById('humidityVal').textContent=cur.humidity+'%';
    document.getElementById('windVal').textContent=dispWind(cur.wind_kph);
    document.getElementById('feelsVal').textContent=dispTemp(cur.feelslike_c)+unitSuffix();
    document.getElementById('visibilityVal').textContent=cur.vis_km+' km';
    document.getElementById('pressureVal').textContent=cur.pressure_mb+' hPa';
    document.getElementById('uvVal').textContent=cur.uv;
    document.getElementById('cloudVal').textContent=cur.cloud+'%';
    document.getElementById('gustVal').textContent=dispWind(cur.gust_kph||0);
    document.getElementById('dewPointVal').textContent=dispTemp(dewPoint(cur.temp_c,cur.humidity))+unitSuffix();

    /* Hi/Lo/Moon */
    document.getElementById('todayHigh').textContent=dispTemp(today.day.maxtemp_c)+unitSuffix();
    document.getElementById('todayLow').textContent=dispTemp(today.day.mintemp_c)+unitSuffix();
    document.getElementById('moonPhase').textContent=moonEmoji(astro.moon_phase||'');

    /* Main icon */
    document.getElementById('main-icon-svg').innerHTML=`<i data-lucide="${getIcon(code)}" style="width:80px;height:80px;color:#2e9aff;"></i>`;

    /* Condition label (multilang) */
    document.getElementById('urdu-summary').textContent=conditionLabel(code);

    /* Advisory */
    const adv=getAdvisory(code,cur.temp_c,cur.uv);
    document.getElementById('advisory-text').textContent=adv;
    document.getElementById('advisory-banner').classList.remove('hidden');

    /* Severe alert */
    checkSevere(code,cur.temp_c);

    /* Gauges */
    setArc('humidity-arc-path','humidity-arc-val',cur.humidity,100,cur.humidity+'%');
    setArc('heat-arc-path','heat-arc-val',Math.min(Math.max(cur.feelslike_c+20,0),60),60,dispTemp(cur.feelslike_c)+'°');
    setArc('rain-arc-path','rain-arc-val',today.day.daily_chance_of_rain,100,today.day.daily_chance_of_rain+'%');

    /* UV */
    updateUV(cur.uv);

    /* Comfort */
    updateComfort(cur.temp_c,cur.humidity);

    /* Sun */
    document.getElementById('sunriseVal').textContent=astro.sunrise;
    document.getElementById('sunsetVal').textContent=astro.sunset;
    updateSunArc(astro.sunrise,astro.sunset);

    /* ★ NEW: Thermometer */
    updateThermometer(cur.feelslike_c);

    /* ★ NEW: Mood Ring */
    updateMoodRing(code, cur.temp_c, cur.humidity);

    /* Compass */
    rotateCompass(cur.wind_dir,cur.wind_kph);

    /* AQI */
    const aqiVal = updateAQI(data);

    /* ★ NEW: Wind Meter */
    updateWindMeter(cur.wind_kph);

    /* ★ NEW: Breathability */
    updateBreathability(aqiVal, cur.humidity, cur.wind_kph);

    /* 7-day forecast cards */
    const labels=[], avgTemps=[];
    const grid=document.getElementById('weeklyGrid');
    grid.innerHTML='';
    data.forecast.forecastday.forEach((day,idx)=>{
        const d=new Date(day.date+'T12:00:00');
        const name=idx===0?'Today':d.toLocaleDateString('en',{weekday:'short'});
        labels.push(name); avgTemps.push(day.day.avgtemp_c);
        const card=document.createElement('div'); card.className='f-card';
        card.innerHTML=`
            <p>${name}</p>
            <i data-lucide="${getIcon(day.day.condition.code)}" class="fc-icon" style="width:20px;height:20px;color:var(--accent)"></i>
            <strong>${dispTemp(day.day.maxtemp_c)}°</strong>
            <span class="fc-min">${dispTemp(day.day.mintemp_c)}°</span>
            <span class="fc-rain">💧${day.day.daily_chance_of_rain}%</span>
        `;
        grid.appendChild(card);
    });

    /* Hourly */
    buildHourly(data);

    /* Chart */
    createChart(labels,avgTemps,data.forecast.forecastday);

    /* ★ NEW: Precip Timeline */
    buildPrecipTimeline(data.forecast.forecastday);

    /* ★ NEW: Feel vs Real */
    buildFeelRealChart(data.forecast.forecastday);

    /* Map */
    loadMap(currentLat,currentLon,currentMapLayer);

    /* Visual effects */
    handleVisualEffects(code);

    /* Trivia */
    triviaPool=TRIVIA; triviaIndex=0;
    document.getElementById('trivia-text').textContent=triviaPool[0];
    document.getElementById('trivia-card').classList.remove('hidden');

    /* Packing */
    buildPacking(code,cur.temp_c,cur.wind_kph,cur.humidity);

    /* Score */
    updateScore(cur.temp_c,cur.humidity,cur.wind_kph,code,cur.uv);

    /* Rain bars */
    buildRainBars(data);

    /* Countdown */
    updateCountdown(data.forecast.forecastday);

    /* ★ NEW: Activities */
    buildActivityCard(code, cur.temp_c, cur.wind_kph, cur.uv);

    /* ★ NEW: Alert History */
    renderAlertHistory();

    /* ★ NEW: Outdoor Planner */
    buildPlanner(data.forecast.forecastday);

    /* ★ NEW: World Cities Ticker */
    loadCityTicker();

    /* Bookmark */
    updateBmButton(loc.name);

    /* Footer */
    document.getElementById('last-updated').textContent=t('updated')+': '+new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    /* Apply translations */
    applyTranslations();

    lucide.createIcons();
    enableDrag(document.getElementById('weeklyGrid'));
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
window.addEventListener('load',()=>{
    applyTheme(currentTheme);
    applyTranslations();
    lucide.createIcons();
    renderBookmarks();
    getUserLocation();
});