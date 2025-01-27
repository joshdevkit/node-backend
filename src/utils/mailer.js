import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.APP_MAILER_HOST,
        port: process.env.APP_MAILER_PORT,
        auth: {
            user: process.env.APP_MAILER_USER,
            pass: process.env.APP_MAILER_PASSWORD,
        },
    });

    let htmlContent = options.html;

    if (options.templatePath) {
        const templatePath = path.resolve(options.templatePath);
        const templateSource = fs.readFileSync(templatePath, "utf-8");

        const template = handlebars.compile(templateSource);
        htmlContent = template(options.templateData || {});
    }

    const mailOptions = {
        from: `"JoshDev" <jshpch1996@gmail.com>`,
        to: options.email,
        subject: options.subject,
        html: htmlContent,
    };

    await transport.sendMail(mailOptions);
};

export default sendEmail;
