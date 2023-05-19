import { useState, useEffect } from "react";
import { BigNumber } from 'ethers'
import { ToastContainer, toast } from 'react-toastify';
import { connectWallet, getCurrentWalletConnected, getContract, disConnectWallet } from './utils/interact';
import { Mint } from "./components/mint";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [walletAddress, setWalletAddress] = useState()
  const [status, setStatus] = useState(null)
  const [loading, setMintLoading] = useState(false)
  const [totalSupply, setTotalSupply] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(null)
  const [maxTokens, setMaxTokens] = useState(0)
  const [traitPattern, setTraitPattern] = useState(null)

  useEffect(() => {
    ( async () => {
        let contract = getContract(walletAddress)
        try {
          let ts = await contract.totalSupply()
          let tp = await contract.tokenPrice()
          let mt = await contract.MAX_TOKENS()
          setTotalSupply(BigNumber.from(ts).toNumber())
          setMaxTokens(BigNumber.from(mt).toNumber())
          setTokenPrice( (BigNumber.from(tp).div(BigNumber.from(1e9).mul(BigNumber.from(1e4))).toString() ) )  // original value * 1e5
        } catch(err) {
          console.log(err)
        }
    })();
  }, [loading, walletAddress])

  useEffect(() => {
    getCurrentWalletConnected()
      .then((walletResponse) => {
        console.log("current res", walletResponse)
        setWalletAddress(walletResponse.address)
        setStatus(walletResponse.status)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    if (status) {
      notify()
      setStatus(null)
    }
  }, [status])

  useEffect(() => {
    let inputArr = [0,1,2,3,4,5,6]
    let results = [];
    for(let len=inputArr.length-1; len>=0; len-- ) {
        results = permute(inputArr, [], len, results);
    }
    setTraitPattern(results)
  }, [])

  const notify = () => toast.info(status, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const permute = (arr, memo, len, results) => {
    var cur, memo = memo || [];
    for (var i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        if (arr.length === len) {
            results.push(memo.concat(cur));
        }
        permute(arr, memo.concat(cur), len, results);
        arr.splice(i, 0, cur[0]);
    }
    return results;
}

  const onConnectWallet = () => {
    connectWallet()
    .then((walletResponse) => {
      setWalletAddress(walletResponse.address)
      setStatus(walletResponse.status)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  const onDisConnectWallet = () => {
    const walletResponse = disConnectWallet()
    console.log("disconnect wallet:", walletResponse)
    setWalletAddress(walletResponse.address)
    setStatus(walletResponse.status)
  }


  return (
    <div>
      <Mint connectWallet={onConnectWallet} disConnectWallet={onDisConnectWallet} walletAddress={walletAddress} maxTokens={maxTokens}
        loading={loading} setMintLoading={setMintLoading} tokenPrice={tokenPrice} setStatus={setStatus} totalSupply={totalSupply} traitPattern={traitPattern}/> 
      <ToastContainer />
    </div>
  );
};

export default App;
