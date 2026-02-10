import {
    BaseInteraction,
    EmbedBuilder,
    InteractionReplyOptions, InteractionResponse,
    InteractionUpdateOptions, Message,
    MessageFlags
} from "discord.js";

type Sendable = string | EmbedBuilder | InteractionReplyOptions;

export class InteractionManager {

    /**
     * InteractionReplyOptions && InteractionUpdateOptions
     * The two have "content", "embeds" & "flags" field, so an internal cast is ok, unless discord/discordjs deprecate it
     */
    private buildReplyOptions(content: Sendable, ephemeral: boolean): InteractionReplyOptions {
        return this._buildOptions(content, ephemeral) as InteractionReplyOptions;
    }

    private buildUpdateOptions(content: Sendable): InteractionUpdateOptions {
        return this._buildOptions(content, false) as InteractionUpdateOptions;
    }

    private _buildOptions(content: Sendable, ephemeral: boolean): InteractionReplyOptions | InteractionUpdateOptions {
        if (typeof content === "string") {
            return { content };
        }
        if (content instanceof EmbedBuilder) {
            if(ephemeral){
                return { embeds: [content], flags: MessageFlags.Ephemeral };
            }
            return { embeds: [content] };
        }
        return content;
    }

    async send(
        interaction: BaseInteraction,
        content: Sendable,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        if (!interaction.isRepliable()) return false;

        const options = this.buildReplyOptions(content, ephemeral);

        if (!interaction.deferred && !interaction.replied) {
            return await interaction.reply(options);
        } else {
            return await interaction.followUp(options);
        }
    }


    async reply(
        interaction: BaseInteraction,
        content: Sendable,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        return await this.send(interaction, content, ephemeral);
    }

    async followUp(
        interaction: BaseInteraction,
        content: Sendable,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        return await this.send(interaction, content, ephemeral)
    }

    async defer(interaction: BaseInteraction): Promise<void> {
        if (!interaction.isRepliable()) return;

        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }
            return;
        }

        if (
            interaction.isButton() ||
            interaction.isAnySelectMenu() ||
            interaction.isModalSubmit()
        ) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
        }
    }

    async update(
        interaction: BaseInteraction,
        content: Sendable,
    ): Promise<void> {
        if (!interaction.isRepliable()) return;

        const options = this.buildUpdateOptions(content)

        // MessageComponent → update()
        if (interaction.isMessageComponent()) {
            await interaction.update(options);
            return;
        }

        // Slash commands → editReply()
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(options);
        }
    }
}