// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;


// forge script script/NFT.s.sol:MyScript --rpc-url $GOERLI_RPC_URL --broadcast --verify -vvvv
import "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "../lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import "../lib/openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import "../lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

import "./ERC4337/core/BaseAccount.sol";
import "./ERC4337/samples/callback/TokenCallbackHandler.sol";



contract SimpleAccount is BaseAccount, TokenCallbackHandler, UUPSUpgradeable, Initializable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public owner;

    uint256 activeRequest;
    uint256 nonce;
    uint256[] recoveryIds;
    address[3] public recoveryAddress;
    mapping (uint256 => bool) idUsed;
    mapping (address => bool) validRecoveryAddr;
    mapping (uint256 => recoveryRequest) recoveryRequestRecord;
    mapping (uint256 => mapping(address => bool)) hasVoted;

    struct recoveryRequest {
        uint256 recoveryID;
        uint256 approvalCount;
        uint256 requestTime;
        address recoveryRequester;
        address[] Authorizers;
        address newOwner;
    }

    IEntryPoint private immutable _entryPoint;

    event SimpleAccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier onlyAuthorized() {
       require (validRecoveryAddr[msg.sender] == true, "UNAUTORIZED USER");
        _;
    }


    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }


    receive() external payable {}

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function _onlyOwner() internal view {
        require(msg.sender == owner || msg.sender == address(this), "only owner");
    }


    function viewOwner() external view returns(address) {
        return owner;
    }

    function viewBalance() external view returns(uint256) {
        return address(this).balance;
    }

    function viewNonce() external view returns(uint256) {
        return nonce;
    }


    function initialize(address anOwner , address[3] memory recoveryAddr) public virtual initializer {
         recoveryAddress = recoveryAddr;
        for(uint i; i < 3; i++) {
            validRecoveryAddr[recoveryAddr[i]] = true;
        }
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit SimpleAccountInitialized(_entryPoint, owner);
    }

    function _requireFromEntryPointOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || msg.sender == owner, "account: not Owner or EntryPoint");
    }

    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
    internal virtual returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value : value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }


    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    function addDeposit() public payable {
        entryPoint().depositTo{value : msg.value}(address(this));
    }

    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
        nonce++;
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _onlyOwner();
    }
    
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
        nonce++;
    }

    function requestRecovery(uint256 activeId, address _newOwner) external {
        require(idUsed[activeId] == false, "ID ALREADY USED");
        require(_newOwner != address(0), "ADDRESSS ZERO REJECTED");
        idUsed[activeId] = true;
        recoveryRequest memory RecoveryRequest;
        RecoveryRequest.recoveryID = activeId;
        RecoveryRequest.recoveryRequester = msg.sender;
        RecoveryRequest.requestTime = block.timestamp;
        RecoveryRequest.newOwner = _newOwner;
        recoveryRequestRecord[activeId] = RecoveryRequest;
        recoveryIds.push(activeId);
    }

    function autorizeRecovery(uint activeId) onlyAuthorized() external {
        require(idUsed[activeId] == true, "INVALID ID");
        require(hasVoted[activeId][msg.sender] == false, "ALREADY VOTED");
        require(block.timestamp >= (recoveryRequestRecord[activeId].requestTime + 1 days), "EXCEEDS RECOVERY TIME");
        hasVoted[activeId][msg.sender] = true;
        recoveryRequestRecord[activeId].approvalCount++;
        recoveryRequestRecord[activeId].Authorizers.push(msg.sender);
        if (recoveryRequestRecord[activeId].approvalCount >= 2) {
            owner = recoveryRequestRecord[activeId].newOwner;
        }
    }
}
