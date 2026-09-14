export const getBaseUrl = () => {
  try {
    if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'about:blank') {
      return window.location.origin;
    }
    const currentHref = window.location.href || '';
    if (currentHref.startsWith('http')) {
      return new URL(currentHref).origin;
    }
  } catch (e) {
    console.warn("Could not parse origin from window.location:", e);
  }
  return 'https://routripo.app';
};

export const getWhatsAppShareMessage = (lang: string = 'mr') => {
  const appLink = `${getBaseUrl()}/app.apk`;
  if (lang === 'mr') {
    return `नमस्कार मित्रा! 'राऊट्रिपो' (RoutTripo) हे आमचं नवीन ट्रॅव्हल प्लॅनर ॲप आहे. खालील लिंकवरून ॲप डाऊनलोड करा आणि इन्स्टॉल करा:\n${appLink}`;
  }
  return `Hey friend! 'RoutTripo' is our trip expense & itinerary planner app. Download and install the app from this link:\n${appLink}`;
};

export const shareAppOnWhatsApp = async (lang: string = 'mr', customMessage?: string) => {
  const message = customMessage || getWhatsAppShareMessage(lang);
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'RoutTripo',
        text: message,
      });
      return;
    }
  } catch (err) {
    console.warn("Native share skipped or failed, opening WhatsApp URL", err);
  }
  
  try {
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error("Failed to open WhatsApp URL:", err);
  }
};

