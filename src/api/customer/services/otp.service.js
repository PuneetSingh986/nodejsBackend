const logger = require("../../../utils/logger");

/**
 * Service for handling OTP operations
 * In a production environment, you would use a real SMS service like Twilio, Nexmo, etc.
 */
class OTPService {
  /**
   * Send OTP to customer's phone
   * @param {string} phone - Customer's phone number
   * @param {string} otp - The OTP code to send
   * @returns {Promise<boolean>} - Whether the OTP was sent successfully
   */
  async sendOTP(phone, otp) {
    try {
      // In production, you would use a real SMS service like:
      // return await this.sendWithTwilio(phone, otp);

      // For development, we'll just log the OTP
      logger.info(`[DEV ONLY] OTP sent to ${phone}: ${otp}`);
      console.log(`[DEV ONLY] 📱 OTP sent to ${phone}: ${otp}`);

      // Simulate successful sending
      return true;
    } catch (error) {
      logger.error(`Error sending OTP to ${phone}: ${error.message}`);
      return false;
    }
  }

  /**
   * Example implementation with Twilio
   * Uncomment and configure for production use
   */
  /*
  async sendWithTwilio(phone, otp) {
    // You would need to install the Twilio SDK: npm install twilio
    const twilio = require('twilio');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    const client = new twilio(accountSid, authToken);
    
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
      from: twilioPhone,
      to: phone
    });
    
    logger.info(`OTP sent to ${phone}, Twilio messageId: ${message.sid}`);
    return true;
  }
  */
}

module.exports = new OTPService();
