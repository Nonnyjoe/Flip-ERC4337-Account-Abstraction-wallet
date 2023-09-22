// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "../lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import "../lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";


import "./account.sol";


contract SimpleAccountFactory {
    SimpleAccount public immutable accountImplementation;
    mapping(address => address) public userToWallet;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccount(_entryPoint);
    }

    function createAccount(uint256 salt, address[3] memory retrievers) public returns (SimpleAccount ret) {
        
        address addr = getAddress(msg.sender, salt, retrievers);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }
        ret = SimpleAccount(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(accountImplementation),
                abi.encodeCall(SimpleAccount.initialize, (msg.sender, retrievers))
            )));
        userToWallet[msg.sender] = address(ret);
    }

    function getAddress(address owner,uint256 salt, address[3] memory retrievers) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(accountImplementation),
                    abi.encodeCall(SimpleAccount.initialize, (owner, retrievers))
                )
            )));
    }

    function getUserAddress(address user) view external returns(address) {
        return userToWallet[user];
    }

    function hasAnAccount(address user) view external returns(bool) {
        if(userToWallet[user] == address(0)){
            return false;
        }
        return true;
    }
}