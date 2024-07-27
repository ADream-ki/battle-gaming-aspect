pragma solidity ^0.8.13;
import "./ownable.sol";
contract  AnimalFactory{
 
    uint dnaDigits = 16;   //宠物DNA位数
    uint dnaLength = 10**dnaDigits;
    mapping (uint => address) public AnimalToOwner;
    mapping (address => uint) ownerAnimalCount;
    uint cooldownTime = 30 seconds;
    
    struct Animal{
        
        string name;
        uint dna;
        uint32 level;
        uint32 readyTime;
        string[] skill;
        
    }
    
    Animal [] public animals;
    
  
    //  孵化宠物函数 
    function hatchAnimal(string name,uint dna) public{
        animals.push(Animal(name,dna));
        
    }
    
    event NewAnimal(uint AnimalId,string name,uint dna);
    
     
    function _createAnimal(string _name,uint _dna) internal{
        uint animalId = animals.push(Animal(_name,_dna,1,uint32(now + cooldownTime)))-1; 
         //  将当前地址对应此时的id 
        AnimalToOwner[animalId] = msg.sender;
        //  这个地址下的宠物数量加一 
        ownerAnimalCount[msg.sender]++;
        NewAnimal(animalId, _name, _dna);
    }

    
    function _generateRandomDna(string _str) private view returns(uint){
        uint rand = uint(keccak256(_str));
        return rand % dnaLength;
    }
    
     function createRandomAnimal(string _name) public {
        //  用户只能创建一次初始宠物  
        require(ownerAnimalCount[msg.sender] == 0);
        uint randDna = _generateRandomDna(_name);
        _createAnimal(_name, randDna);
    }

    
     
}
