import nodemailer from "nodemailer";
import dotenv from "dotenv";
import pQueue from "p-queue";

dotenv.config();

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

export const smsSender = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const {
      smtps,
      smsList,
      senderName,
      smsSubject,
      smsMessage,
    } = req.body;

    const smtpCount = smtps.length;
    const senderCount = senderName.length;
    const subjectCount = smsSubject.length;
    const messageCount = smsMessage.length;

    const smtpServers = smtps.map(({ host, port, email, password, security }) => ({
      host,
      port,
      secure: security === 'SSL' ? true : security === 'SSL/TLS' ? true : security === 'Tls' ? false : false,
      auth: { user: email, pass: password },
    }));

    const createTransporter = (smtpConfig) => nodemailer.createTransport(smtpConfig);

    const getRandomTransporter = () => createTransporter(getRandomElement(smtpServers));

    const smsQueue = new pQueue({ concurrency: 100 });

    const sendSMS = async (
      phoneNumber,
      senderName,
      smsSubject,
      smsMessage
    ) => {
      const transporter = getRandomTransporter();

      const numericPhoneNumber = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';

      const personalizedMessage = smsMessage.replace(/{userPhone}/g, numericPhoneNumber);

      const mailOptions = {
        from: {
          name: senderName,
          address: transporter.options.auth.user,
        },
        to: phoneNumber,
        subject: smsSubject,
        text: personalizedMessage,
      };

      const options = {
        ...mailOptions,
        from: { ...mailOptions.from, address: transporter.options.auth.user },
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`SMS sent to ${phoneNumber}: ${info.response}`);
        return { phoneNumber, status: 'success' };
      } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
        return { phoneNumber, status: 'failed', error: error.message };
      }
    };

    const results = await Promise.all(
      smsList.map((phoneNumber, index) =>
        smsQueue.add(() =>
          sendSMS(
            phoneNumber,
            senderName[index % senderCount],
            smsSubject[index % subjectCount],
            smsMessage[index % messageCount]
          )
        )
      )
    );

    res.status(200).json({ message: 'SMS sent successfully', results });
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    res.status(500).json({ message: 'Failed to send SMS', error: error.message });
  }
};
