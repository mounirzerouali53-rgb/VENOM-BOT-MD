module.exports = {
    name: 'تجربة',
    category: 'عام',
    async execute(sock, msg, args, extra) {
        try {
            const remoteJid = extra.from;

            // إرسال الرسالة باستخدام الهيكل الخام مباشرة
            await sock.relayMessage(remoteJid, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: { title: "VENOM SYSTEM TEST", hasMediaAttachment: false },
                            body: { text: "🛡️ إذا وصلت هذه الرسالة، فقد نجح نظام الإرسال الخام (Raw Payload)." },
                            footer: { text: "© 2026 VENOM-MD" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "📜 القائمة الرئيسية",
                                            id: ".مساعدة"
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { messageId: msg.key.id + "_TEST" });

        } catch (err) {
            // طباعة أي خطأ مهما كان صغيراً
            console.log('--- ERROR LOG ---');
            console.error(err);
            await sock.sendMessage(extra.from, { text: "⚠️ حدث خطأ: " + err.message }, { quoted: msg });
        }
    }
};
