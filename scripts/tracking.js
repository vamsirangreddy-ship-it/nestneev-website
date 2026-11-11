/*
 * Analytics / ads tracking snippets, driven by content/tracking.json
 * (editable in the CMS: Site Settings -> "Tracking & Analytics").
 *
 * Every value is validated before it is written into a page, so a typo or
 * a pasted full snippet can never break the site: anything that does not
 * look like a real ID is ignored (with a warning in the build log).
 * Leave a box empty and that tool is simply not loaded.
 */

const RULES = {
  gtmId: /^GTM-[A-Z0-9]{4,10}$/,
  ga4Id: /^G-[A-Z0-9]{6,14}$/,
  metaPixelId: /^\d{8,20}$/,
  googleAdsId: /^AW-\d{6,14}$/,
  googleAdsLeadLabel: /^[A-Za-z0-9_-]{6,40}$/,
  googleAdsCallLabel: /^[A-Za-z0-9_-]{6,40}$/,
  googleAdsWhatsappLabel: /^[A-Za-z0-9_-]{6,40}$/,
};

// Verification codes: accept the bare code OR the whole <meta ...> tag pasted from Google/Facebook.
function verificationCode(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  const m = v.match(/content\s*=\s*["']([^"']+)["']/i);
  const code = (m ? m[1] : v).trim();
  return /^[A-Za-z0-9_-]{10,100}$/.test(code) ? code : "";
}

function clean(raw) {
  const t = raw && typeof raw === "object" ? raw : {};
  const out = {};
  const warnings = [];
  for (const [key, rule] of Object.entries(RULES)) {
    const v = String(t[key] || "").trim().toUpperCase() === "" ? "" : String(t[key]).trim();
    const val = key.endsWith("Id") && key !== "metaPixelId" ? v.toUpperCase() : v;
    if (!val) continue;
    if (rule.test(val)) out[key] = val;
    else warnings.push(`tracking.${key} "${val}" does not look valid - ignored.`);
  }
  out.searchConsoleCode = verificationCode(t.searchConsoleVerification);
  out.facebookDomainCode = verificationCode(t.facebookDomainVerification);
  if (t.searchConsoleVerification && !out.searchConsoleCode) warnings.push("tracking.searchConsoleVerification not recognised - ignored.");
  if (t.facebookDomainVerification && !out.facebookDomainCode) warnings.push("tracking.facebookDomainVerification not recognised - ignored.");
  out.eventTracking = t.eventTracking !== false; // default on
  out.customHeadCode = typeof t.customHeadCode === "string" ? t.customHeadCode.trim() : "";
  return { tracking: out, warnings };
}

function enabled(t) {
  return !!(t.gtmId || t.ga4Id || t.metaPixelId || t.googleAdsId);
}

// Goes at the end of <head>.
function headHtml(t) {
  if (!t) return "";
  const parts = [];
  if (t.searchConsoleCode) parts.push(`<meta name="google-site-verification" content="${t.searchConsoleCode}">`);
  if (t.facebookDomainCode) parts.push(`<meta name="facebook-domain-verification" content="${t.facebookDomainCode}">`);

  if (enabled(t)) parts.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}</script>`);

  if (t.gtmId) {
    parts.push(
      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${t.gtmId}');</script>`
    );
  }

  // Google tag (GA4 and/or Google Ads) - one gtag.js load covers both IDs.
  const gtagIds = [t.ga4Id, t.googleAdsId].filter(Boolean);
  if (gtagIds.length) {
    parts.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}"></script>` +
        `<script>gtag('js',new Date());${gtagIds.map((id) => `gtag('config','${id}');`).join("")}</script>`
    );
  }

  if (t.metaPixelId) {
    parts.push(
      `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script');fbq('init','${t.metaPixelId}');fbq('track','PageView');</script>`
    );
  }

  if (t.customHeadCode) parts.push(t.customHeadCode);
  return parts.join("\n");
}

// Goes right after <body>.
function bodyHtml(t) {
  if (!t) return "";
  const parts = [];
  if (t.gtmId) parts.push(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${t.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`);
  if (t.metaPixelId) parts.push(`<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${t.metaPixelId}&ev=PageView&noscript=1"></noscript>`);
  return parts.join("\n");
}

// Small event layer at the end of <body>: Call / WhatsApp clicks, enquiry
// "thank you" page (= lead), property page views. Sends to whichever tools
// are configured (dataLayer for GTM, gtag for GA4/Ads, fbq for Meta).
function eventScript(t) {
  if (!t || !enabled(t) || !t.eventTracking) return "";
  const cfg = {
    ga: !!t.ga4Id,
    ads: t.googleAdsId || "",
    lead: t.googleAdsLeadLabel || "",
    call: t.googleAdsCallLabel || "",
    wa: t.googleAdsWhatsappLabel || "",
    fb: !!t.metaPixelId,
  };
  return `<script>(function(){var C=${JSON.stringify(cfg)};
function send(name,params,fbName,label){params=params||{};try{
window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:name,eventParams:params});
if(C.ga&&window.gtag)gtag('event',name,params);
if(C.ads&&label&&window.gtag)gtag('event','conversion',{send_to:C.ads+'/'+label});
if(C.fb&&window.fbq&&fbName)fbq('track',fbName,params);
}catch(e){}}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';
if(h.indexOf('tel:')===0)send('click_to_call',{link_url:h,page_path:location.pathname},'Contact',C.call);
else if(h.indexOf('wa.me/')>-1||h.indexOf('api.whatsapp.com')>-1)send('click_whatsapp',{page_path:location.pathname},'Contact',C.wa);},true);
var p=location.pathname;
if(p.indexOf('/thank-you')===0){var k='nn_lead_ts',now=Date.now(),last=0;try{last=+sessionStorage.getItem(k)||0;}catch(e){}
if(now-last>60000){try{sessionStorage.setItem(k,String(now));}catch(e){}send('generate_lead',{form:'enquiry'},'Lead',C.lead);}}
else if(p.indexOf('/property/')===0){send('view_item',{item_name:document.title},'ViewContent');}
})();</script>`;
}

module.exports = { clean, headHtml, bodyHtml, eventScript, enabled };
