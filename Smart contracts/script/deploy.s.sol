// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/accountFactory.sol";

interface ICHILD {
       function viewOwner() external view returns(address);
       function withdrawDepositTo(address payable withdrawAddress, uint256 amount) external;
       function addDeposit() external payable;
       function execute(address dest, uint256 value, bytes calldata func) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}


contract deploy is Script {
    SimpleAccountFactory _SimpleAccountFactory;
    address _admin = payable(0xA771E1625DD4FAa2Ff0a41FA119Eb9644c9A46C8);
    address _user = payable(0xBB9F947cB5b21292DE59EFB0b1e158e90859dddb);
    address token = 0x203eef5b8ac17d3d59071b393067b64A52ADA681;
    address[3] recover = [0x13B109506Ab1b120C82D0d342c5E64401a5B6381, 0xfd182E53C17BD167ABa87592C5ef6414D25bb9B4, 0xBB9F947cB5b21292DE59EFB0b1e158e90859dddb];
    address _child ;
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        _SimpleAccountFactory = new SimpleAccountFactory(IEntryPoint(0x0576a174D229E3cFA37253523E645A78A0C91B57));
        _child = address(_SimpleAccountFactory.createAccount(2021, recover ));
        
        //Verify owner of smart wallet
        address owner =  ICHILD(_child).viewOwner();
        console.log(owner);

        // Deposit into wallet
        depositIntoWallet();
        // transfer from wallet back to admin EOA
        transferFromWallet();

        // mint tokens to smart account
        mintTokenToSmartWallet();

        // Execute transfer using Smart Wallet
        executeTransferUsingSmartWallet();
        vm.stopBroadcast();
    }

    function depositIntoWallet() public {
        // vm.deal(address(this), 3 ether);
        ICHILD(_child).addDeposit{value: 0.001 ether}();
    }

    function transferFromWallet() public {
        ICHILD(_child).withdrawDepositTo(payable(_user), 0.001 ether);
    }

    function mintTokenToSmartWallet() public {
        IERC20(token).mint(_child, (100 * 10 ** 18));
    }

    function executeTransferUsingSmartWallet() public {
        // ABI encoding for the transfer function
        bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(_user), 50*10**18);
        ICHILD(_child).execute(token, 0, data);
    }


    
}

