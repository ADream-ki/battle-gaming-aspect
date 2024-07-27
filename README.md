# PetSkill Aspect

## Instruction

This use case aims to implement a pet eating flow limiter that limits the number of times a pet can acquire skills within a certain period of time to ensure the healthy growth of the pet character and the balance of the game.

## Solution Overview

### Question

Pet characters can acquire new skills by completing quests or meeting certain conditions. Therefore, in order to make the game more interesting, players can make their pets learn different skills by feeding them different foods, so as to increase the challenge and fun of the game.

### Solution

To this end, I designed and implemented a pet skill acquisition restrictor. This restrictor maintains the balance of the game and enhances the player's experience by obtaining the corresponding skills from the type of food after the pet eats and making the pet learn probability.

## Project Design

After the aspect is bound to the corresponding contract, it will be started when the pet feeding function is called, and the scheduled operation will be executed at the same time
'''js
postContractCall(input: PostContractCallInput): void {
let calldata = uint8ArrayToHex(input.call!.data);
let method = this.parseCallMethod(calldata);
    let random = Math.random();
    if (method == "" && random > 0.9) {
      let Skill = this.getSkillsList(Aspect.PET_SKILLS_STORAGE_KEY);
      let Sys_Skill = this.getSkillsList(Aspect.SYS_SKILLS_STORAGE_KEY);
      let isIn = false;
      let skill;
      while (!isIn) {
        skill = Sys_Skill[Math.floor(Math.random() * Sys_Skill.length)];
        for (let i = 0; i < Skill.length; ++i) {
          if (skill == Skill[i]) {
            isIn = true;
            break;
          }
        }
      }
      this.addSkill(skill, input);
    }

}
'''

## The value that Aspect brings to the Artela ecosystem

Provide corresponding application cases for Artela, enrich the Artela ecosystem, and provide development cases for other developers
