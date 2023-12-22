import { useState, useEffect } from 'react';
import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

const contractAddress = '0xA688D514d51eAAEc38cf07112b2bc8E1E1716187';


function App() {
  const { status, connect, account, ethereum } = useMetaMask();
  const [loading, setLoading] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractTransferLoading, setContractTransfer] = useState(false);
  const [balance, setBalance] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);
  const [contract, setContract] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showWriteContractSection, setShowWriteContractSection] = useState(false);

  const startPayment = async ({ ether, addr }) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      ethers.utils.getAddress(addr);
      const tx = await signer.sendTransaction({
        to: addr,
        value: ethers.utils.parseEther(ether)
      });
      setTransactionCode(tx.hash)
      toast.success('Contract details fetched successfully!', tx.hash);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setContractTransfer(false)
    }
  };

  const handleTransferEthButtonClick = async (e) => {
    e.preventDefault();
    setContractTransfer(true)
    await startPayment({
      ether: transferAmount,
      addr: recipientAddress
    });
  };

  // const handleTransferEthButtonClick = async () => {
  //   try {
  //     setContractTransfer(true);
  //     // Validate recipient address
  //     if (!ethers.utils.isAddress(recipientAddress)) {
  //       throw new Error('Invalid recipient address');
  //     }

  //     // Validate transfer amount
  //     const amountInWei = ethers.utils.parseEther(transferAmount);
  //     if (amountInWei.isNegative() || amountInWei.isZero()) {
  //       throw new Error('Invalid transfer amount');
  //     }

  //     // Call the transfer function
  //     const tx = await ethereum.request({
  //       method: 'eth_sendTransaction',
  //       params: [
  //         {
  //           to: recipientAddress,
  //           value: amountInWei.toHexString(),
  //           gas: '0x5208', // Gas limit (optional)
  //         },
  //       ],
  //     });

  //     // Wait for the transaction to be mined
  //     await ethereum.wait(1);

  //     console.log('ETH transferred successfully!');
  //     toast.success('ETH transferred successfully!');
  //   } catch (error) {
  //     console.error('Error transferring ETH:', error.message);
  //     toast.error(`Error transferring ETH: ${error.message}`);
  //   } finally {
  //     setContractTransfer(false);
  //   }
  // };


  const mintNFT = async () => {
    try {
      setLoading(true);
      const tx = await contract.mint();
      await tx.wait();
      console.log('NFT minted successfully!');
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const readContractDetails = async () => {
    try {
      setContractLoading(true);
      const contractBalance = await contract.balanceOf(account);
      const mockTransaction = {
        type: contractBalance.type,
        confirmations: contractBalance.confirmations,
        from: contractBalance.from,
        gasPrice: ethers.utils.formatEther(contractBalance.gasPrice),
        gasLimit: ethers.utils.formatEther(contractBalance.gasLimit),
        maxPriorityFeePerGas: ethers.utils.formatEther(contractBalance.maxPriorityFeePerGas),
        maxFeePerGas: ethers.utils.formatEther(contractBalance.maxFeePerGas),
        value: ethers.utils.formatEther(contractBalance.value)
      };
      console.log(contractBalance, "contractBalance")
      setTransactionInfo(mockTransaction);
      toast.success('Contract details fetched successfully!');
    } catch (error) {
      console.error('Error reading contract details:', error);
      toast.error('Error reading contract details.');
    } finally {
      setContractLoading(false);
    }
  };

  const handleMintButtonClick = async () => {
    try {
      if (ethereum && account) {
        await mintNFT();
      }
    } catch (error) {
      console.error('Error handling mint button click:', error);
    }
  };

  const handleReadContractButtonClick = async () => {
    try {
      if (ethereum && account && contract) {
        await readContractDetails();
      }
    } catch (error) {
      console.error('Error handling read contract button click:', error);
    }
  };

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        if (ethereum && account) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner(account);
          const newContract = new ethers.Contract(
            contractAddress, ['function mint()', 'function balanceOf(address)'],
            signer
          );
          setContract(newContract);
          const ethBalance = await provider.getBalance(account);
          const formattedEthBalance = ethers.utils.formatEther(ethBalance);
          setBalance(formattedEthBalance);
        }
      } catch (error) {
        console.error('Error fetching account details:', error.message);
        console.error(error);
        toast.error('Error fetching account details.');
      }
    };
    fetchAccountDetails();
  }, [ethereum, account]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="container mt-6">
          <div className="border p-4 text-center">
            {status === 'initializing' && <div className="small">Synchronisation with MetaMask ongoing...</div>}
            {status === 'unavailable' && <div className="small">MetaMask not available :( 🥶</div>}
            {status === 'notConnected' && (
              <button className="btn btn-primary small" onClick={connect}>
                Connect to MetaMask
              </button>
            )}
            {status === 'connecting' && <div className="small">Connecting...</div>}
            {status === 'connected' && (
              <div>
                <div className="flex justify-content-center" style={{ "gap": "27px" }}>
                  <h1 className="small mb-4 badge bg-danger">Connected account
                    <span className='badge bg-danger'>
                      {account}
                    </span>
                  </h1>
                  <span>{"   "}</span>
                  <h1 className="badge bg-info">
                    {balance !== null ? `Available balance: ${balance}` : 'Loading...'}
                  </h1>
                </div>
                <div className="d-flex justify-content-center" style={{ "gap": "27px" }}>
                  <button
                    className="btn btn-success small"
                    onClick={handleMintButtonClick}
                    disabled={loading}
                  >
                    {loading ? 'Minting...' : 'Mint NFT'}
                  </button>
                  <button
                    className="btn btn-success small"
                    onClick={handleReadContractButtonClick}
                    disabled={contractLoading}
                  >
                    {contractLoading ? 'Fetching...' : 'Read Contract'}
                  </button>

                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowWriteContractSection(true)}
                    >
                      Write Contract
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showWriteContractSection && (
              <div className="border p-4 row mt-5 mb-3">
                <div className="col">
                  <label htmlFor="recipientAddress" className="form-label">
                    Recipient Address:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipientAddress"
                    placeholder="Enter recipient's Ethereum address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <div className="col">
                  <label htmlFor="transferAmount" className="form-label">
                    Transfer Amount (ETH):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="transferAmount"
                    placeholder="Enter amount to transfer"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleTransferEthButtonClick}
                  disabled={contractTransferLoading}
                >
                  {contractTransferLoading ? 'Transferring...' : 'Transfer ETH'}
                </button>
              </div>
            )}
            {
              transactionCode ? <span className='badge bg-success'>
                <span>Your </span>
                Txn. {transactionCode}
              </span> : ''
            }
          </div>
          <div>
            {transactionInfo && (
              <div className="mt-3 small text-white">
                <h2>Transaction Information</h2>
                <table className="table table-bordered text-white">
                  <tbody>
                    {Object.entries(transactionInfo).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td className='text-success'>{(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </header >
    </div >
  );
}

export default App;
