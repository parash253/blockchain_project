import React, { useState } from 'react'
import { AppBar, Toolbar, Container, Box, Typography } from '@mui/material';
import Web3 from 'web3';
import SimpleStorage from '.././contracts/SimpleStorage.json';

const Viewer = () => {
  const [account, setAccount] = useState('');
  const [storedHashes, setStoredHashes] = useState([]);

  const loadBlockchainData = async (currentAccount) => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    const activeAccount = currentAccount || accounts[0];
    setAccount(activeAccount);
    const networkId = await web3.eth.net.getId();
    const networkData = SimpleStorage.networks[networkId];
    // For detecting network Data, truffle config must point to correct ganache networks. check truffle config file configuration.
    if (networkData) {
      const contractInstance = new web3.eth.Contract(SimpleStorage.abi, networkData.address);
      const recipientfiles = await contractInstance.methods.getFilesByRecipientAddress(activeAccount).call();

      const hashes = recipientfiles.map(file => ({ ipfsHash: file.ipfsHash, studentName: file.studentName, studentHobby: file.studentHobby }));
      setStoredHashes(hashes);
    } else {
      window.alert('SimpleStorage contract not deployed to detected network.');
    }
  };

  React.useEffect(() => {
    loadBlockchainData();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        loadBlockchainData(accounts[0]);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);


  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ backgroundColor: '#002e7b' }}>
        <Toolbar>
          <Typography variant="h6" component="div" style={{ fontSize: '2em', flexGrow: 1}}>
            Viewer Dashboard
          </Typography>
          <Typography variant="h6" component="div" style={{ fontSize: '1.3em' }}>
            Your Account: {account}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} py={4}>
        <Box flex={1} p={2} style={{ fontSize: '1.5em', textAlign: 'justify'}}>
          {storedHashes.map((file) => (
            <h2>Hi {file.studentName},</h2>
          ))}
          <h2>Your Credentials direct from the Blockchain.</h2>
          <p>These Credentials are directly fetched from blockchain and IPFS server based on your Account.</p>
          <p>There are lots of things going in the background but to put it simple, things are done this way.</p>
          <p>
            While fetching the data, the system first fetch data from the blockchain along with hash of the file, 
            then the system look for that specific hash file in the IPFS server and returns that file along with other relevant data.
          </p>
        </Box>
        
        <Box flex={1} p={1}>
          {storedHashes.length > 0 && (
            <Box flex={2} p={2} style={{ fontSize: '1.5em', textAlign: 'justify'}}>

              {storedHashes.map((file, index) => (
                <div key={index}>
                  <img
                    src={`https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/${file.ipfsHash}`}
                    alt={`Uploaded file ${index + 1}`}
                    style={{ width: '100%'}}
                  />
                  <div>
                    <p>Student Name: {file.studentName}</p>
                    <p>Certificate Name: {file.studentHobby}</p>
                  </div>
                </div>
              ))}
            </Box>
          )} 
        </Box>
      </Box>
    </Container>
  );
};

export default Viewer;
