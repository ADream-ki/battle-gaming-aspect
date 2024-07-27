pragma solidity ^0.8.13;

import "./AnimalFeeding.sol";

contract AnimalHelper is AnimalFeeding {
        
    modifier aboveLevel(uint _level, uint _AnimalId) {
         require(animals[_AnimalId].level >= _level);
         _;
    }
     
     //  当宠物等级达到2级时就可以自己改名 
    function changeName(uint _AnimalId, string _newName) external aboveLevel(2,_AnimalId){
        require(msg.sender ==  AnimalToOwner[_AnimalId]);
        animals[_AnimalId].name = _newName;
        
    }
    
     //  当宠物等级达到4级时就可以自己改DNA 
    function changeDna(uint _AnimalId, uint _newDna) external aboveLevel(4,_AnimalId) {
        require(msg.sender ==  AnimalToOwner[_AnimalId]);
        animals[_AnimalId].dna = _newDna;
    }
       
    function getAnimalsByOwner(address _owner) external view returns(uint[]) {
        
         uint[] memory result = new uint[](ownerAnimalCount[_owner]);
         
         uint counter = 0;
         for (uint i = 0; i < animals.length; i++) {
         if (AnimalToOwner[i] == _owner) {
               result[counter] = i;
                counter++;
      }
    }
         return result;

    }

 
}

