export const getWhatsAppShareMessage = (lang: string = 'mr') => {
  const appLink = `${window.location.origin}/app.apk`;
  if (lang === 'mr') {
    return `नमस्कार मित्रा! 'प्रवास वाटाघाटी' (Pravas Wataghati) हे आमचं नवीन ट्रॅव्हल प्लॅनर ॲप आहे. खालील लिंकवरून ॲप डाऊनलोड करा आणि इन्स्टॉल करा:\n${appLink}`;
  }
  return `Hey friend! 'Pravas Wataghati' is our trip expense & itinerary planner app. Download and install the app from this link:\n${appLink}`;
};

export const shareAppOnWhatsApp = async (lang: string = 'mr', customMessage?: string) => {
  const message = customMessage || getWhatsAppShareMessage(lang);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Pravas Wataghati',
        text: message,
      });
      return;
    } catch (err) {
      console.error("Native share failed, falling back", err);
    }
  }
  
  const encodedText = encodeURIComponent(message);
  // Using api.whatsapp.com/send which works seamlessly on both mobile app and web browser
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
