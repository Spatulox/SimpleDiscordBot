import {ChatInputCommandInteraction} from "discord.js";
import {ModalFieldType, ModalManager} from "../../manager/interactions/ModalManager";

export async function modal_test(interaction: ChatInputCommandInteraction) {

    console.log(ModalManager.parseNumber("0259678325"))
    console.log(ModalManager.parseDate("2020-12-20"))
    console.log(ModalManager.parseDate("12-20-2020"))
    console.log(ModalManager.parseDate("2020/12/20"))
    console.log(ModalManager.parseDate("12/20/2020"))

    const modal = ModalManager.create("Title", "title id")
    ModalManager.add(modal, [
        {type: ModalFieldType.SHORT, label: "Name"},
        {type: ModalFieldType.LONG, label: "Para"},
        {type: ModalFieldType.DATE, label: "Date"},
        {type: ModalFieldType.NUMBER, label: "Number"},
        {type: ModalFieldType.PHONE, label: "Phone"},
    ])
    interaction.showModal(modal)

    /*const modal2 = ModalManager.simple("mod2", "Simple Title", {type: ModalFieldType.SHORT, label: "Simple"})
    interaction.showModal(modal2)*/

    /*const modal3 = ModalManager.titleDescription("mod3", "TitreDesc Title", {label: "Title Desc"}, {label: "Desc desc"})
    interaction.showModal(modal3)*/

    /*const modal4 = ModalManager.date("mod4", "Date Title")
    interaction.showModal(modal4)*/

    /*const modal5 = ModalManager.number("mod5", "Number Title")
    interaction.showModal(modal5)*/

    /*const modal6 = ModalManager.phone("mod6", "Phone Title")
    interaction.showModal(modal6)*/

    /*interaction.reply({
        content: "Hello, world!",
        embeds: [modal, modal2, modal3, modal4, modal5, modal6],
        components: []
    })*/
}