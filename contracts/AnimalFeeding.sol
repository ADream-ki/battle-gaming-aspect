pragma solidity ^0.4.19;
import "./AnimalFactory.sol";

contract  AnimalFeeding is AnimalFactory{
    let animalId;
    
     //  实现进食功能    宠物   食物DNA 
    function feedAndGrow(uint _AnimalId,uint _targetDna) internal {
        // 确保当前的宠物是自己的  
        require(msg.sender == AnimalToOwner[_AnimalId]);
        //  获取这个宠物的DNA
        Animal storage myAnimal = animals[_AnimalId];
        
        //必须等到宠物的冷却周期 
         require(_isReady(myAnimal));
         
         _targetDna = _targetDna % dnaLength;
         uint newDna = (myAnimal.dna + _targetDna) / 2;
         newDna = newDna - newDna % 100 + 99;
         _createAnimal("No-one", newDna);
         
         // 触发了宠物新的冷却周期
          _triggerCooldown(myAnimal);
    }
    
    //实现添加技能功能
    function add(string skillName) public {
        // 向指定动物的技能数组中添加技能
        animals[animalId].skill.push(skillName);
        emit SkillAdded(animalId, skillName);
    }
    event SkillAdded(uint indexed animalId, string skillName);


    function _catchFood(uint _name) internal pure returns (uint){
        uint rand = uint(keccak256(_name));
        return rand;
    }
    
    function feedOnFood(uint _AnimalId,uint _FoodId) public{
        uint foodDna = _catchFood(_FoodId);
        feedAndGrow(_AnimalId,foodDna);
    }

    function _triggerCooldown(Animal storage _Animal) internal {
       _Animal.readyTime = uint32(now + cooldownTime);
    }
    
    // 是否到了宠物的冷却时间 
    function _isReady(Animal storage _Animal) internal view returns (bool) {
      return (_Animal.readyTime <= now);
    }
    
}
