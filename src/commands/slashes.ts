// @ts-nocheck

import { 
  ApplicationCommandOptionType,
  EmbedBuilder,
  type CommandInteraction
} from "discord.js";
import { 
  Discord, 
  Slash, 
  SlashOption,
} from "discordx";


import { getWeatherNow } from "../apis/weather.ts";



@Discord()
export class Weather {
  private static readonly COOLDOWN = 5000; // 5 seconds cooldown
  private lastUsed: Map<string, number> = new Map();

  @Slash({ description: "Check the weather in a city", name: 'current-weather' })
  async min(
    @SlashOption({
      description: "City name to check weather",
      name: "input",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    input: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    try {
      // Check cooldown
      const userId = interaction.user.id;
      const now = Date.now();
      const lastUse = this.lastUsed.get(userId) ?? 0;
      
      if (now - lastUse < Weather.COOLDOWN) {
        await interaction.reply({
          content: `Please wait ${Math.ceil((Weather.COOLDOWN - (now - lastUse)) / 1000)} seconds before using this command again.`,
          ephemeral: true
        });
        return;
      }

      // Update last used timestamp
      this.lastUsed.set(userId, now);

      //get data
      const data = await getWeatherNow(input)
      

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Weather for ${data.location}`)
        .setDescription(`
          ${data.weather_status.temp} - ${data.weather_status.condition.text}`)
        .setImage(`https:${data.weather_status.condition.img}`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription(`Error occured. Please enter a valid city or try again. ${error.message}`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      await interaction.reply({embeds: [embed]});
    }
  }
}
