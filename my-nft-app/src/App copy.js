import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [mintCount, setMintCount] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerBalance, setOwnerBalance] = useState(0);
  const [loading, setLoading] = useState(false); // New loading state

  const contractAddress = '0xA688D514d51eAAEc38cf07112b2bc8E1E1716187'; // Replace with your contract address

  const initializeEthers = async () => {
    const ethereumProvider = await detectEthereumProvider();

    if (ethereumProvider) {
      const ethersProvider = new ethers.providers.Web3Provider(ethereumProvider);
      const nftContract = new ethers.Contract(
        contractAddress,
        ['function mint()', 'function getCurrentTokenIdCounter()', 'function balanceOf(address)'],
        // ethersProvider.getSigner()
      );

      return { provider: ethersProvider, contract: nftContract };
    } else {
      console.error('MetaMask not detected.');
      toast.error('MetaMask not detected.');
      return null;
    }
  };


  const fetchWalletInfo = async () => {
    try {
      setLoading(true);

      if (contract && account) {
        // Fetch the balance
        const balance = await contract.balanceOf(account);
        setOwnerBalance(balance);
      }

      toast.success('Wallet information fetched successfully.');
    } catch (error) {
      console.error('Error fetching wallet information:', error);
      toast.error('Error fetching wallet information.');
    } finally {
      setLoading(false);
    }
  };


  const connectWallet = async () => {
    try {
      const initializationResult = await initializeEthers();

      if (initializationResult) {
        const { provider: initializedProvider, contract: initializedContract } = initializationResult;

        setProvider(initializedProvider);

        // Use ethereum provider directly for requesting accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
        setContract(initializedContract);
        console.log(initializedContract, "test")
        if (initializedContract && accounts.length > 0) {
          // Fetch the balance after connecting
          const balance = await initializedContract.balanceOf(accounts[0]);
          // console.log(balance, "balance ")
          setOwnerBalance(balance.value.toString());
          console.log("connected", balance.value.toString());
        }

        toast.success('MetaMask Connected.');
      } else {
        console.error('Error connecting to wallet: Initialization failed.');
        toast.error('Error connecting to wallet.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      toast.error('Error connecting to wallet.');
    }
  };




  const mintNFT = async () => {
    try {
      setLoading(true); // Set loading to true when minting starts
      const tx = await contract.mint();
      await tx.wait();
      console.log('NFT minted successfully!');
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Error minting NFT.');
    } finally {
      setLoading(false); // Set loading to false when minting completes (success or error)
    }
  };

  const fetchOwnerBalance = async () => {
    try {
      setLoading(true);
      const balance = await contract.balanceOf(ownerAddress);
      console.log('Returned balance:', balance);
      setOwnerBalance(balance.value.toString());
      toast.success(`Balance for address ${ownerAddress}: ${balance.type}`);
    } catch (error) {
      console.error('Error fetching owner balance:', error);
      toast.error('Error fetching owner balance.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>My NFT @ React</h1>
        {account ? (
          <div>
            <p>Connected Account: {account}</p>
            <p>Mint Count: {mintCount}</p>
            <button onClick={mintNFT} disabled={loading}>
              {loading ? 'Minting...' : 'Mint NFT'}
            </button>
            <div>
              <input
                type="text"
                placeholder="Enter owner address"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
              />
              <button onClick={fetchOwnerBalance} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Owner Balance'}
              </button>
              <p>Owner Balance: {ownerBalance}</p>
            </div>
          </div>
        ) : (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet @ Install MetaMask'}
          </button>
        )}
      </header>
      <ToastContainer />
    </div>
  );
};

export default App;
