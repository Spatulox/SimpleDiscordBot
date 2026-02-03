import { RandomBotActivity } from "../src";
import { ActivityType } from "discord.js"

export const randomActivityList: RandomBotActivity = [
    {type: ActivityType.Playing, message: "a normal game"},
    {type: ActivityType.Playing, message: "a hard game"},
    {type: ActivityType.Playing, message: "a weird game"}
];