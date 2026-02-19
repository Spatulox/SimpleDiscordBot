import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder, ButtonInteraction,
} from "discord.js";
import { ButtonManager } from "../interactions/ButtonManager.js";

export interface Page {
    embed: EmbedBuilder;
    content?: string;
}

export class PaginationManager {
    static create(
        pages: Page[],
        interaction: any,
        options: { time?: number; idle?: number } = {}
    ) {
        const time = options.time ?? 60000;
        const idle = options.idle ?? 15000;

        if (!pages || pages.length === 0) {
            console.error("Au moins une page est requise");
            return null;
        }


        let currentPage = 0;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                ButtonManager.secondary({
                    customId: `pag_first_${interaction.id}`,
                    emoji: "⏪"
                }),
                ButtonManager.secondary({
                    customId: `pag_prev_${interaction.id}`,
                    emoji: "⬅️"
                }),
                ButtonManager.secondary({
                    customId: `pag_stop_${interaction.id}`,
                    emoji: "⏹️"
                }),
                ButtonManager.secondary({
                    customId: `pag_next_${interaction.id}`,
                    emoji: "➡️"
                }),
                ButtonManager.secondary({
                    customId: `pag_last_${interaction.id}`,
                    emoji: "⏩"
                })
            );

        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i: ButtonInteraction) => i.user.id === interaction.user.id,
            time,
            idle
        });

        collector.on('collect', async (i: ButtonInteraction) => {
            await i.deferUpdate();

            switch (i.customId) {
                case `pag_first_${interaction.id}`:
                    currentPage = 0;
                    break;
                case `pag_prev_${interaction.id}`:
                    currentPage = Math.max(0, currentPage - 1);
                    break;
                case `pag_next_${interaction.id}`:
                    currentPage = Math.min(pages.length - 1, currentPage + 1);
                    break;
                case `pag_last_${interaction.id}`:
                    currentPage = pages.length - 1;
                    break;
                case `pag_stop_${interaction.id}`:
                    collector.stop();
                    return i.editReply({ components: [] });
            }

            if (currentPage < 0 || currentPage >= pages.length) {
                collector.stop();
                return i.editReply({
                    content: "Page invalide !",
                    components: [],
                    embeds: []
                });
            }

            const page = pages[currentPage]!;
            const newRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    ButtonManager.secondary({
                        customId: `pag_first_${interaction.id}`,
                        emoji: "⏪",
                        disabled: currentPage === 0
                    }),
                    ButtonManager.secondary({
                        customId: `pag_prev_${interaction.id}`,
                        emoji: "⬅️",
                        disabled: currentPage === 0
                    }),
                    ButtonManager.secondary({
                        customId: `pag_stop_${interaction.id}`,
                        emoji: "⏹️"
                    }),
                    ButtonManager.secondary({
                        customId: `pag_next_${interaction.id}`,
                        emoji: "➡️",
                        disabled: currentPage === pages.length - 1
                    }),
                    ButtonManager.secondary({
                        customId: `pag_last_${interaction.id}`,
                        emoji: "⏩",
                        disabled: currentPage === pages.length - 1
                    })
                );

            await i.editReply({
                embeds: [page.embed],
                content: page.content ?? undefined,
                components: [newRow]
            });
        });

        return {
            collector,
            replyContent: {
                embeds: [pages[0]!.embed],
                components: [row]
            }
        };
    }
}