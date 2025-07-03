import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '***REMOVED***';
const authToken = process.env.TWILIO_AUTH_TOKEN || '***REMOVED***';
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Cambia si tienes otro número de sandbox

const client = twilio(accountSid, authToken);

export async function sendWhatsApp(to: string, message: string) {
  console.log('[Twilio] Enviando WhatsApp a:', to);
  console.log('[Twilio] Mensaje:', message);
  try {
    const result = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log('[Twilio] Mensaje enviado correctamente:', result.sid);
    return result;
  } catch (error) {
    console.error('[Twilio] Error al enviar WhatsApp:', error);
    throw error;
  }
} 