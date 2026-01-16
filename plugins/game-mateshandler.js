let handler = m => m
handler.before = async function (m) {
    if (!/^-?[0-9]+$/.test(m.text)) return true
    let id = m.chat
    this.math = this.math ? this.math : {}

    if (!m.quoted || !m.quoted.fromMe || !/RETO MATEMATICO/i.test(m.quoted.text)) return true
    if (!(id in this.math)) return true

    if (m.quoted.id == this.math[id][0].key.id) {
        let math = JSON.parse(JSON.stringify(this.math[id][1]))
        let user = global.db.data.users[m.sender]

        if (parseInt(m.text) == math.result) {
            let diamantesGanados = math.maxDiamond > 0 ? Math.floor(Math.random() * math.maxDiamond) + 1 : 0

            user.coin += math.bonus
            user.exp += math.xp
            user.diamond += diamantesGanados

            clearTimeout(this.math[id][3])
            delete this.math[id]

            let res = `> ✅ *¡𝗘𝗫𝗖𝗘𝗟𝗘𝗡𝗧𝗘!*\n\n`
            res += `> @${m.sender.split('@')[0]}, lo lograste rápido.\n`
            res += `> 🎁 *Tu premio:* ${math.bonus} coins y ${math.xp} de experiencia.`
            if (diamantesGanados > 0) res += `\n> 💎 *Extra:* Te llevas ${diamantesGanados} diamante(s).`

            await m.react('✨')
            return this.reply(m.chat, res, m, { mentions: [m.sender] })
        } else {
            this.math[id][2]--
            if (this.math[id][2] <= 0) {
                clearTimeout(this.math[id][3])
                delete this.math[id]
                return m.reply(`> ❌ *Se acabaron las oportunidades.*\n> La respuesta era: ${math.result}. ¡A la próxima será!`)
            }
            return m.reply(`> ⚠️ *Casi, pero no.*\n> Te quedan ${this.math[id][2]} intentos. ¡Tú puedes!`)
        }
    }
    return true
}
export default handler