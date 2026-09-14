export function playEmergencySound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    // Frequency oscillation for siren sound effect
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.75);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.0);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(now + 1.2);
  } catch (e) {
    console.warn("Audio Context sound playback not allowed or failed:", e);
  }
}

export async function sendAppNotification(
  title: string,
  body: string,
  priority: 'high' | 'normal' = 'normal',
  tag: string = 'pw-notification'
): Promise<boolean> {
  // Trigger vibration if supported
  if ('vibrate' in navigator) {
    try {
      if (priority === 'high') {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } else {
        navigator.vibrate([150, 50, 150]);
      }
    } catch (e) {
      // Vibration not permitted
    }
  }

  // Play audio alarm for high priority emergency
  if (priority === 'high') {
    playEmergencySound();
  }

  // Check Web Notification permission
  if (!('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.warn('Could not request notification permission:', e);
    }
  }

  if (permission !== 'granted') {
    return false;
  }

  // Attempt PWA ServiceWorker push notification first
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon-192.png',
          vibrate: priority === 'high' ? [300, 100, 300, 100, 500] : [200, 100, 200],
          requireInteraction: priority === 'high',
          tag,
          renotify: true,
          data: { url: window.location.href, timestamp: Date.now() }
        } as any);
        return true;
      }
    }
  } catch (err) {
    console.warn('ServiceWorker showNotification failed, using fallback Notification API:', err);
  }

  // Fallback to standard Notification API
  try {
    new Notification(title, {
      body,
      icon: '/icon.svg',
      vibrate: priority === 'high' ? [300, 100, 300, 100, 500] : [200, 100, 200],
      requireInteraction: priority === 'high',
      tag
    } as any);
    return true;
  } catch (err) {
    console.warn('Notification constructor failed:', err);
    return false;
  }
}

/**
 * High Priority Emergency SOS Broadcast
 */
export async function notifyEmergencySOS(memberName: string, lang: string = 'mr') {
  let title = '🚨 EMERGENCY SOS ALERT!';
  let body = `🚨 EMERGENCY: ${memberName} needs immediate help!`;

  if (lang === 'mr') {
    title = '🚨 आणीबाणी (SOS) इशारा!';
    body = `🚨 आणीबाणी: ${memberName} ला तातडीने मदतीची गरज आहे!`;
  } else if (lang === 'hi') {
    title = '🚨 आपातकालीन (SOS) अलर्ट!';
    body = `🚨 आपातकालीन: ${memberName} को तुरंत सहायता की आवश्यकता है!`;
  }

  return sendAppNotification(title, body, 'high', 'emergency-sos');
}

/**
 * Event Notification: Expense Added
 */
export async function notifyExpenseAdded(memberName: string, amount: number | string, expenseTitle: string, currencySymbol: string = '₹', lang: string = 'mr') {
  let title = '💸 New Expense Added';
  let body = `${memberName} added a new expense: ${currencySymbol}${amount} (${expenseTitle})`;

  if (lang === 'mr') {
    title = '💸 नवीन खर्च नोंदवला';
    body = `${memberName} ने नवीन खर्च जोडला: ${currencySymbol}${amount} (${expenseTitle})`;
  } else if (lang === 'hi') {
    title = '💸 नया खर्च जोड़ा गया';
    body = `${memberName} ने नया खर्च जोड़ा: ${currencySymbol}${amount} (${expenseTitle})`;
  }

  return sendAppNotification(title, body, 'normal', 'expense-added');
}

/**
 * Event Notification: Trip Settled
 */
export async function notifyTripSettled(tripName: string, lang: string = 'mr') {
  let title = '🎉 Trip Settled!';
  let body = `Trip "${tripName}" has been successfully settled!`;

  if (lang === 'mr') {
    title = '🎉 हिशोब पूर्ण झाला!';
    body = `"${tripName}" सहलीचा सर्व हिशोब यशस्वीरित्या पूर्ण झाला आहे!`;
  } else if (lang === 'hi') {
    title = '🎉 हिसाब पूरा हुआ!';
    body = `ट्रिप "${tripName}" का पूरा हिसाब चुकता हो गया है!`;
  }

  return sendAppNotification(title, body, 'normal', 'trip-settled');
}

/**
 * Event Notification: Member Joined
 */
export async function notifyMemberJoined(memberName: string, tripName: string, lang: string = 'mr') {
  let title = '👥 New Member Joined';
  let body = `${memberName} was added to the trip "${tripName}".`;

  if (lang === 'mr') {
    title = '👥 नवीन सोबती समाविष्ट';
    body = `${memberName} ला "${tripName}" सहलीमध्ये जोडण्यात आले आहे.`;
  } else if (lang === 'hi') {
    title = '👥 नया सदस्य जुड़ा';
    body = `${memberName} को "${tripName}" ट्रिप में जोड़ा गया।`;
  }

  return sendAppNotification(title, body, 'normal', 'member-joined');
}

/**
 * Event Notification: AI Morning Briefing Alert
 */
export async function notifyAIBriefing(tripName: string, lang: string = 'mr') {
  let title = '🌅 Daily Trip Briefing Ready';
  let body = `Your daily Smart travel plan is ready for "${tripName}".`;

  if (lang === 'mr') {
    title = '🌅 सकाळचे नियोजन तयार';
    body = `"${tripName}" सहलीसाठी तुमचे आजचे दैनंदिन नियोजन तयार आहे.`;
  } else if (lang === 'hi') {
    title = '🌅 सुबह का नियोजन तैयार';
    body = `"${tripName}" ट्रिप के लिए आपकी दैनिक योजना तैयार है।`;
  }

  return sendAppNotification(title, body, 'normal', 'ai-briefing');
}
