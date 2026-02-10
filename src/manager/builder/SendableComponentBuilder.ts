import {
    ActionRowBuilder,
    EmbedBuilder,
    InteractionReplyOptions,
    InteractionUpdateOptions, MessageCreateOptions,
    MessageFlags,
    MessageActionRowComponentBuilder
} from "discord.js";

//Any interface/type with those fields
type MessageFields = {
    content?: string | null | undefined;
    embeds?: any;
    components?: any;
};

export type SendableComponent = EmbedBuilder | InteractionReplyOptions | InteractionUpdateOptions | ActionRowBuilder<MessageActionRowComponentBuilder>;

export class SendableComponentBuilder {

    private static build<T extends MessageFields>(
        base: T,
        content?: string,
        component?: SendableComponent
    ): T {
        if (content) {
            base.content = content;
        }

        if (component instanceof EmbedBuilder) {
            base.embeds = [component];
        }

        if (component instanceof ActionRowBuilder) {
            base.components = [component];
        }
        return base
    }

    static buildInteraction(
        content?: string,
        component?: SendableComponent,
        ephemeral: boolean = false
    ): InteractionReplyOptions | InteractionUpdateOptions {
        let base: InteractionReplyOptions | InteractionUpdateOptions = {}
        base = this.build(base, content, component);

        if (ephemeral) {
            base.flags = [MessageFlags.Ephemeral]
        }

        return base;
    }

    static buildMessage(
        content?: string,
        component?: SendableComponent,
    ): MessageCreateOptions {
        let base: MessageCreateOptions = {}
        return this.build(base, content, component);
    }
}