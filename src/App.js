import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const App = () => {
    const contractABI = abi.abi;
    const [allWaves, setAllWaves] = useState([]);
    const [currentAccount, setCurrentAccount] = useState("");
    const contractAddress = "0x06aD87c0007c6479C3f1b19f8214dE2032c43B74";
    const [counter, setCounter] = useState(0);
    const input = useRef();


  const rickRoll = () => {
    window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }

  const inputHandler = (event) => {
    input.current = event.target.value;
  }
    
    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const wavePortalContract = new ethers.Contract(contractAddress,                     contractABI, provider);
                console.log(wavePortalContract);
                try{
                  console.log("entering try branch");
                  const waveCount = await  wavePortalContract.getTotalWaves(); 
                  setCounter(waveCount.toNumber());
             
                }catch(error){
                  console.log("there was an error", error);
                }
                
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const getWaveCount = async () => {
  
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
      console.log(wavePortalContract);
      console.log("hello");
      const waveCount = await wavePortalContract.getTotalWaves();
      console.log("yo");
      console.log(`wavecount: ${waveCount}`);
      setCounter(waveCount.toNumber());
    }
  
    const wave = async (message) => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                setCounter(counter + 1);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI,  signer);
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
                /*
                 * Execute the actual wave from your smart contract
                 */
                const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
                console.log("Mining...", waveTxn.hash);
                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);
                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

  const waveTwo = async () => {
        const randomFloat = Math.random();
        if(randomFloat < 0.2){
          rickRoll();
          return;
        }
        try {
            const { ethereum } = window;

            if (ethereum) {
                let waveTxn;
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
                /*
                 * Execute the actual wave from your smart contract
                 */
                if (input.current == null || input.current === "" ){
                  waveTxn = await wavePortalContract.wave("No message :(", { gasLimit: 300000 });
                  }
              else{
                waveTxn = await wavePortalContract.wave(input.current, { gasLimit: 300000 });
              }
                console.log("Mining...", waveTxn.hash);
                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);
                count = await wavePortalContract.getTotalWaves();
                setCounter(count.toNumber());
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllWaves = async () => {
        const { ethereum } = window;

        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                const waves = await wavePortalContract.getAllWaves();

                const wavesCleaned = waves.map((wave) => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                        isWin: wave.isWin
                    };
                });

                setAllWaves(wavesCleaned);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect( () => {
        checkIfWalletIsConnected();
        getAllWaves()
    }, []);

    


    useEffect(() => {
        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);
            setAllWaves((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
        }
        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, []);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">👋 Hello there!</div>

                <div className="bio">
          Welcome to WaveBook! My name is Amin, CEO of Wavebook.
      <br/>
          Connect your Ethereum wallet, write a message, send a wave!
          <br/>
          Each time you send a wave you have a 50% chance of winning some Rinkeby! 💯
          <br/>
          <br/>
          Total Waves: {counter}
          <br/>
          <br/>
                </div>
                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}
                <br/>
                <input type="text" placeholder="Write a Message" onChange={inputHandler}/>              
                <button className="waveButton" onClick={() => waveTwo()}>
                    Wave at Me
                </button>

                {allWaves.map((wave, index) => {
                    return (
                        <div key={index} className="message" style={{ marginTop: "16px"}}>
                            <div>Address: {wave.address}</div>
                            <div>Time: {wave.timestamp.toString()}</div>
                            <div>Message: {wave.message}</div>
                            <div>Did you win the Rinkeby Lottery?: {wave.isWin ? "Yes! 😁" : "No 😔"}</div>
                            <br/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default App;
