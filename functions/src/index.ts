import * as functions from "firebase-functions";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(functions.config().sendgrid.key);

export const sendWaitlistEmail = functions.firestore
  .document("waitlist/{userId}")
  .onCreate(async (snap) => {
    const data = snap.data();

    const msg = {
      to: data.email,
      from: {
        email: "kindralabs@gmail.com", // must be verified
        name: "TraceVault Team",
      },
      subject: "Welcome to the Waitlist 🎉",
      text: `Hi ${data.name || "there"}, thanks for joining TraceVault!`,
      html: `<strong>Hi ${data.name || "there"}, thanks for joining TraceVault!</strong>`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email sent to:", data.email);
    } catch (error: any) {
      console.error("SendGrid error:", error.response?.body || error);
    }
  });
