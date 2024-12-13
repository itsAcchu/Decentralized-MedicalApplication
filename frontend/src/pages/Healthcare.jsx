import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Healthcare = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [patientID, setPatientID] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [patientRecords, setPatientRecords] = useState([]);

  const [providerAddress, setProviderAddress] = useState('');
  const contractAddress = '0x35Dc15dB716896250B2f0321f7F9Ef2314d38fDC';

  const contractABI = [
    // ABI JSON goes here
  ];

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        const accountAddress = await signer.getAddress();
        setAccount(accountAddress);

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const ownerAddress = await contract.getOwner();
        setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
      } catch (error) {
        console.error('Error connecting to wallet: ', error);
      }
    };
    connectWallet();
  }, []);

  const fetchPatientRecords = async () => {
    try {
      const records = await contract.getPatientRecords(patientID);
      setPatientRecords(records);
    } catch (error) {
      console.error('Error fetching patient records', error);
    }
  };

  const addRecord = async () => {
    try {
      const tx = await contract.addRecord(patientID, 'Alice', diagnosis, treatment);
      await tx.wait();
      fetchPatientRecords();
    } catch (error) {
      console.error('Error adding records', error);
    }
  };

  const authorizeProvider = async () => {
    if (isOwner) {
      try {
        const tx = await contract.authorizeProvider(providerAddress);
        await tx.wait();
        alert(`Provider ${providerAddress} authorized successfully`);
      } catch (error) {
        console.error('Only contract owner can authorize different providers');
      }
    } else {
      alert('Only contract owner can call this function');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-blue-500 text-center mb-6">Decentralized Patents Records</h1>
      {account && <p className="text-center text-gray-700 mb-4">Connected Account: {account}</p>}
      {isOwner && <p className="text-center text-gray-600 mb-4">You are the contract owner</p>}

      <div className="mb-10 p-6 bg-gray-100 border border-gray-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">Fetch Patient Records</h2>
        <input
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
          type="text"
          placeholder="Enter Patient ID"
          value={patientID}
          onChange={(e) => setPatientID(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={fetchPatientRecords}
        >
          Fetch Records
        </button>
      </div>

      <div className="mb-10 p-6 bg-gray-100 border border-gray-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">Add Patient Record</h2>
        <input
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <input
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={addRecord}
        >
          Add Records
        </button>
      </div>

      <div className="mb-10 p-6 bg-gray-100 border border-gray-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">Authorize HealthCare Provider</h2>
        <input
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
          type="text"
          placeholder="Provider Address"
          value={providerAddress}
          onChange={(e) => setProviderAddress(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={authorizeProvider}
        >
          Authorize Provider
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-blue-500 mb-4">Patient Records</h2>
        {patientRecords.map((record, index) => (
          <div
            key={index}
            className="mb-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <p className="text-gray-700">Record ID: {record.recordID.toNumber()}</p>
            <p className="text-gray-700">Diagnosis: {record.diagnosis}</p>
            <p className="text-gray-700">Treatment: {record.treatment}</p>
            <p className="text-gray-700">
              Timestamp: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Healthcare;
