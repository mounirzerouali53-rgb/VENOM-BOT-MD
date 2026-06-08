const tttGames = new Map();

function boardToEmoji(board) {

    return board.map(v => {

        if (v === "❌" || v === "⭕") return v;

        return `${v}️⃣`;

    }).reduce((acc, val, idx) => {

        if ((idx + 1) % 3 === 0) return acc + val + "\n";

        return acc + val;

    }, "");

}

function checkWin(board) {

    const wins = [

        [0,1,2],[3,4,5],[6,7,8],

        [0,3,6],[1,4,7],[2,5,8],

        [0,4,8],[2,4,6]

    ];

    for (let w of wins) {

        if (board[w[0]] === board[w[1]] && board[w[1]] === board[w[2]]) {

            return board[w[0]];

        }

    }

    return null;

}

module.exports = {

    name: "اكس",

    aliases: ["xo", "تيك تاك تو"],

    category: "games",

    description: "لعبة إكس أو",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذه اللعبة متاحة فقط في المجموعات.'

                }, { quoted: msg });

            }

            if (!tttGames.has(from)) {

                tttGames.set(from, { 

                    board: ["1","2","3","4","5","6","7","8","9"], 

                    turn: "❌",

                    players: [sender]

                });

                

                return await sock.sendMessage(from, {

                    text: `*╔═══〔 🎮 لعبة إكس أو 〕═══╗*\n\n${boardToEmoji(tttGames.get(from).board)}\n\n*📝 اكتب: .تحرك رقم*\n*🎯 دور: ${tttGames.get(from).turn}*`

                }, { quoted: msg });

            }

            if (args[0] === 'تحرك' && args[1]) {

                const game = tttGames.get(from);

                if (!game) return;

                const pos = parseInt(args[1]) - 1;

                if (isNaN(pos) || pos < 0 || pos > 8 || game.board[pos] === "❌" || game.board[pos] === "⭕") {

                    return await sock.sendMessage(from, {

                        text: "❌ اختيار غير صالح!"

                    }, { quoted: msg });

                }

                game.board[pos] = game.turn;

                game.turn = game.turn === "❌" ? "⭕" : "❌";

                const winner = checkWin(game.board);

                

                if (winner) {

                    await sock.sendMessage(from, {

                        text: `*╔═══〔 🎉 فائز 〕═══╗*\n\n${boardToEmoji(game.board)}\n\n*👑 الفائز: ${winner}*`

                    }, { quoted: msg });

                    tttGames.delete(from);

                    return;

                }

                if (!game.board.some(v => v !== "❌" && v !== "⭕")) {

                    await sock.sendMessage(from, {

                        text: `*╔═══〔 🤝 تعادل 〕═══╗*\n\n${boardToEmoji(game.board)}\n\n*🤝 اللعبة انتهت بالتعادل*`

                    }, { quoted: msg });

                    tttGames.delete(from);

                    return;

                }

                await sock.sendMessage(from, {

                    text: `*╔═══〔 🎮 تحديث 〕═══╗*\n\n${boardToEmoji(game.board)}\n\n*🎯 دور: ${game.turn}*`

                }, { quoted: msg });

            }

        } catch (error) {

            console.error('خطأ في لعبة اكس:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};
