import { useState, useEffect } from "react";
import { getContract } from "../utils/interact"
import { BigNumber } from 'ethers'

export const Mint = (props) => {
    const { setStatus, loading, walletAddress, setMintLoading, tokenPrice, connectWallet, disConnectWallet, totalSupply, maxTokens, traitPattern } = props
    const [mintCount, setMintCount] = useState(0)
    const reserveId = []

    function onChangeMintCount(isIncrea) {
      let newCount = isIncrea ? mintCount + 1 : mintCount - 1
      if ( newCount > 10 ) newCount = 10
      if ( newCount < 0 ) newCount = 0
      if ((newCount+totalSupply) > maxTokens ) {
        newCount = maxTokens-totalSupply
      }
      setMintCount(newCount)
    }

    async function onMint() {
      let occupied_list, total_list, available_list;
      if (mintCount == 0) return
      if (!walletAddress) {
          setStatus('Please connect your Wallet')
          return
      }
      const contract = getContract(walletAddress)
      // Get already Occupied Token List from contract
      try {
        let ol = await contract.occupiedList()
        occupied_list = ol.map( bn => BigNumber.from(bn).toNumber() );
      } catch (err) {
        let errorContainer =  (err.data && err.data.message)  ? err.data.message : ''
        let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
        let status = "Transaction failed because you have insufficient funds or sales not started"
        errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
        setMintLoading(false)
      }
      // Get available list 
      total_list = Array.from(Array(maxTokens).keys())
      available_list = total_list.filter(id => !occupied_list.includes(id))
      // Mint token using contract function
      setMintLoading(true)
      try {
          let shuffled = available_list.sort(function(){return .5 - Math.random()});
          let mint_list = shuffled.slice(0, mintCount);
          let trait_pattern = [];
          mint_list.forEach(id => {
            trait_pattern.push(traitPattern[id])
          });

          console.log(mint_list, trait_pattern)

          let tx = await contract.mintToken(mint_list, trait_pattern, { value: BigNumber.from(1e9).mul(BigNumber.from(1e4)).mul(tokenPrice).mul(mintCount), from: walletAddress })
          let res = await tx.wait()
          if (res.transactionHash) {
              setStatus(`You minted ${mintCount} DoDA Successfully`)
              setMintLoading(false)
              setMintCount(0)
          }
      } catch (err) {
          let errorContainer =  (err.data && err.data.message)  ? err.data.message : ''
          console.log("contract err", err.message)
          let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
          let status = "Transaction failed because you have insufficient funds or sales not started"
          errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
          setMintLoading(false)
      }
    }

    return (
      <div id='mint' className='text-center'>
        <div className='container'>
          <div className='row'>
            <div className="col-sm-1" ></div>
            <div className="col-sm-10">
              <p className="title">CLAIM YOUR DoDA </p>
              <div className="mint-box">
                <div className="total-supply">{totalSupply} / {maxTokens}</div>
                <div className="mint-count">
                  <button className="minus-btn" onClick={() => onChangeMintCount(false)}> - </button>
                  <input type="number" readOnly value={mintCount} />   
                  <button className="plus-btn" onClick={() => onChangeMintCount(true)}> + </button>
                </div>
                <div className="max-token">
                  {10} MINT MAX
                </div>              
                <div id="mint-content" className="text-center">
                  {mintCount} DoDA - TOTAL: {mintCount * tokenPrice/100000 } + GAS
                </div>

                <div className="mint-btn-group">
                  {
                    walletAddress ?
                    <button id="connect-wallet-btn" onClick={ disConnectWallet }> { walletAddress.slice(0, 11) }...  </button>
                    :
                    <button id="connect-wallet-btn" onClick={ connectWallet }> CONNECT METAMASK </button>
                  }
                  {
                    loading ?
                    <button id="mint-btn" > MINTING... </button>
                    :
                    <button id="mint-btn" onClick={e => onMint(e)} > MINT </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  