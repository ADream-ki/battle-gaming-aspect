import {
  BigInt,
  BytesData,
  ethereum,
  hexToUint8Array,
  IAspectOperation,
  IPostContractCallJP,
  JitCallBuilder,
  OperationInput,
  PostContractCallInput,
  stringToUint8Array,
  sys,
  uint8ArrayToHex,
  uint8ArrayToString,
} from "@artela/aspect-libs";
import { Protobuf } from "as-proto/assembly/Protobuf";

/**
 * There are two types of Aspect: Transaction-Level Aspect and Block-Level Aspect.
 * Transaction-Level Aspect will be triggered whenever there is a transaction calling the bound smart contract.
 * Block-Level Aspect will be triggered whenever there is a new block generated.
 *
 * An Aspect can be Transaction-Level, Block-Level,IAspectOperation or both.
 * You can implement corresponding interfaces: IAspectTransaction, IAspectBlock,IAspectOperation or both to tell Artela which
 * type of Aspect you are implementing.
 */
export class Aspect implements IPostContractCallJP, IAspectOperation {
  static readonly PET_SKILLS_STORAGE_KEY = "PET_SKILLS_STORAGE_KEY";
  static readonly SYS_SKILLS_STORAGE_KEY = "SYS_SKILLS_STORAGE_KEY";

  postContractCall(input: PostContractCallInput): void {
    let calldata = uint8ArrayToHex(input.call!.data);
    let method = this.parseCallMethod(calldata);

    // if method is 'feedAndGrow(uint, uint)'
    // method 应该等于 函数对应的哈希值的前8位，使用parseCallMethod解析
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

  //****************************
  // internal methods
  //****************************
  addSkill(Skill: u8, input: PostContractCallInput): void {
    let currentCaller = uint8ArrayToHex(input.call!.from);
    let addCalldata = ethereum.abiEncode("add", [
      ethereum.Number.fromU8(Skill, 8),
    ]);

    // Construct a JIT request (similar to the user operation defined in EIP-4337)
    let request = JitCallBuilder.simple(
      currentCaller,
      input.call!.to,
      hexToUint8Array(addCalldata)
    ).build();

    // Submit the JIT call
    let response = sys.hostApi.evmCall.jitCall(request);

    // Verify successful submission of the call,
    // call may fail if room is full
    if (!response.success) {
      sys.log(
        `Failed to submit the JIT call: ${currentCaller}, err: ${
          response.errorMsg
        }, ret: ${uint8ArrayToString(response.ret)}`
      );
    } else {
      sys.log(
        `Successfully submitted the JIT call: ${currentCaller}, ret: ${uint8ArrayToString(
          response.ret
        )}`
      );
    }
  }

  rmPrefix(data: string): string {
    if (data.startsWith("0x")) {
      return data.substring(2, data.length);
    } else {
      return data;
    }
  }

  getPetSkills(): string {
    return uint8ArrayToHex(
      sys.aspect.mutableState
        .get<Uint8Array>(Aspect.PET_SKILLS_STORAGE_KEY)
        .unwrap()
    );
  }

  parseCallMethod(calldata: string): string {
    if (calldata.startsWith("0x")) {
      return calldata.substring(0, 10);
    }
    return "0x" + calldata.substring(0, 8);
  }

  getSkillsList(KEY: string): Array<string> {
    // 假设宠物技能以某种方式存储在区块链的mutableState中，这里我们使用PET_SKILLS_STORAGE_KEY作为键
    let skillsKey = sys.aspect.mutableState.get<Uint8Array>(KEY);
    let encodeSkills = uint8ArrayToHex(skillsKey.unwrap());

    let encodeCount = encodeSkills.slice(0, 4);
    let count = BigInt.fromString(encodeCount, 16).toInt32();
    const array = new Array<string>();
    encodeSkills = encodeSkills.slice(4);
    for (let i = 0; i < count; ++i) {
      let skillData = encodeSkills.slice(40 * i, 40 * (i + 1));
      let skillKey = uint8ArrayToHex(skillData.slice(0, 20)); // Assuming the first 20 bytes are the skill key
      array.push(skillKey);
    }
    return array;
  }
  //****************************
  // unused methods
  //****************************

  isOwner(sender: Uint8Array): bool {
    // implement me
    // if return false，bind、unbind、upgrade Aspect will be block
    return true;
  }
}
