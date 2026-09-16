import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PHONE_NUMBER_ID = process.env.META_WA_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.META_WA_ACCESS_TOKEN;

/**
 * Send WhatsApp OTP to User (Console output for dev + Meta Cloud API ready)
 */
export const sendWhatsAppOtp = async (mobile, otp) => {
  // Always log prominently to server console in dev mode
  console.log(`\n========================================`);
  console.log(`📱 [WHATSAPP OTP DISPATCH]`);
  console.log(`👤 Recipient: +91-${mobile}`);
  console.log(`🔐 OTP CODE : >>> ${otp} <<< (Valid for 5 mins)`);
  console.log(`========================================\n`);

  // If live Meta credentials exist, call Meta Graph API
  if (PHONE_NUMBER_ID && ACCESS_TOKEN) {
    try {
      const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: `91${mobile}`,
          type: 'text',
          text: {
            body: `🔐 Aapka V2Online Portal registration OTP hai: *${otp}*. Ye OTP 5 minute ke liye valid hai. Kripya kisi se share na karein.`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, metaResponse: response.data };
    } catch (error) {
      console.error('⚠️ Meta WhatsApp API Error:', error.response?.data || error.message);
      // Fallback: OTP is still available on console for development
      return { success: false, error: error.message };
    }
  }

  return { success: true, mode: 'console_dev_mode' };
};

/**
 * Send WhatsApp General Notification Alert (Operator, Agent, Admin)
 */
export const sendWhatsAppNotification = async (mobile, message) => {
  console.log(`\n🔔 [WHATSAPP NOTIFICATION] -> +91-${mobile}: ${message}\n`);

  if (PHONE_NUMBER_ID && ACCESS_TOKEN) {
    try {
      const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: `91${mobile}`,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('⚠️ Meta WhatsApp API Notification Error:', error.response?.data || error.message);
    }
  }
};
