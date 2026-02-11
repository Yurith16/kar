import { checkReg } from '../lib/checkReg.js';

let handler = async (m, { conn, text, isAdmin, isOwner, participants }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Verificación de registro
    if (await checkReg(m, user)) return;

    // Verificar que sea un grupo
    if (!m.isGroup) {
        await m.react('❌');
        return m.reply(`> *Este comando solo funciona en grupos, corazón.*`);
    }

    // Verificar si el usuario es administrador
    if (!isAdmin && !isOwner) {
        await m.react('⚠️');
        return m.reply(`> *Solo los administradores pueden usar este comando, cielo.*`);
    }

    try {
        // Reacción de procesamiento
        await m.react('⚙️');

        // Obtener participantes y decodificar JIDs
        const allParticipants = participants.map(p => ({
            jid: conn.decodeJid(p.id),
            name: p.notify || p.id.split('@')[0],
            admin: p.admin
        }));
        
        const totalMembers = allParticipants.length;

        // Mensaje personalizado o por defecto
        const customMessage = text ? `> ${text}\n\n` : '> *¡Atención a todos!* 🌟\n\n';

        // Construir el mensaje con lista numerada SIN @
        let message = customMessage;
        message += `> *Total de miembros:* ${totalMembers}\n\n`;
        message += `> *Lista de miembros:*\n`;

        // Agregar cada miembro con número solamente
        allParticipants.forEach((participant, index) => {
            const number = index + 1;
            const adminBadge = participant.admin ? ' 👑' : '';
            message += `> ${number}. ${participant.name}${adminBadge}\n`;
        });

        // Crear array de menciones separado
        const mentions = allParticipants.map(p => p.jid);

        // Enviar mensaje con menciones
        await conn.sendMessage(m.chat, {
            text: message,
            mentions: mentions
        }, { quoted: m });

        // Reacción de éxito
        await m.react('✅');

        // Mensaje de confirmación
        await m.reply(`> *Etiqueté a ${totalMembers} miembros exitosamente.* 🌸`);

    } catch (error) {
        console.error('[KarBot TagAll Error]:', error);
        await m.react('❌');
        await m.reply(`> *Vaya drama...* Hubo un error al etiquetar a los miembros.`);
    }
}

handler.help = ['tagall (mención a todos)'];
handler.tags = ['group'];
handler.command = /^(tagall|todos|mentionall)$/i;
handler.group = true;
handler.admin = true;

export default handler;