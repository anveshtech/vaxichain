import nodemailer from "nodemailer";

export const sendBulkEmail = async (options) => {
  try {
    if (!Array.isArray(options)) {
      throw new TypeError('The "options" parameter must be an array.');
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SENDER_ADDRESS,
        pass: process.env.APPPASSWORD,
      },
      authMethod: "LOGIN",
      tls: {
        rejectUnauthorized: false,
      },
    });

    const promiseArray = options.map((option) => transport.sendMail(option));

    const result = await Promise.allSettled(promiseArray);
    transport.close();
    return result;
  } catch (error) {
    console.error("Detailed Error in sendBulkEmail", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export default sendBulkEmail; // Use default export
