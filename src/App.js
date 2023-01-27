import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import _ from 'lodash';

function App() {
  //------------------------------------------
  // HOOKS & VARIABLES
  //------------------------------------------

  // States
  const [maxTransactions, setMaxTransactions] = useState([]);
  const [errorMessages, setErrorMessages] = useState()
  
  // Effects
  useEffect(() => {
    fetchData()
  }, []);
  //------------------------------------------
  // HANDLERS & AUX FUNCTIONS
  //------------------------------------------

  const fetchData = async () => {

    // NOTE: A proxy URL to BUDA API is set up in the package.json file to avoid 
    // CORS error when fetching data:
    
    // {
    //   ...,
    //   "proxy": "https://www.buda.com/api/v2",
    //   ...
    // }

    let { data: dataMarkets } = await axios.get('/markets');
    let { markets } = dataMarkets;
    let timestamp_24hrs_ago = _.now() - 24 * 60 * 60 * 1000;
    let maxTransactionsToUpdate = [];


    for (let eachMarket of markets) {
      let { data: dataTradesForMarket } = await axios.get(
        `/markets/${eachMarket.id}/trades?timestamp=${timestamp_24hrs_ago}`
      ).catch((err)=>{
        console.log(err)
        setErrorMessages('Error: Too many requests. Please refresh page in 1 minute')
      });
      let { trades: tradesForMarket } = dataTradesForMarket;
      let { entries: tradeEntriesForMarket } = tradesForMarket;
      let maxTransactionOfMarket = {
        market: '',
        amount: 0,
        price: 0,
        maxTransaction: 0,
        timestamp: 0,
        direction: '',
      };

      maxTransactionOfMarket.market = tradesForMarket.market_id;

      for (let eachTradeEntry of tradeEntriesForMarket) {
        
        let timestamp = eachTradeEntry[0];
        let amount = Number(eachTradeEntry[1]).toFixed(2)
        let price = Number(eachTradeEntry[2]).toFixed(2)
        let transaction = amount*price;
        let direction = eachTradeEntry[3];

        if (transaction > maxTransactionOfMarket.maxTransaction) {
          maxTransactionOfMarket.maxTransaction = transaction;
          maxTransactionOfMarket.timestamp = timestamp;
          maxTransactionOfMarket.amount = amount;
          maxTransactionOfMarket.price = price;
          maxTransactionOfMarket.direction = direction;
        }
      }
      maxTransactionsToUpdate.push(maxTransactionOfMarket);
    }
    setMaxTransactions([...maxTransactionsToUpdate]);
  };


  //------------------------------------------
  // JSX
  //------------------------------------------

  return (
    <Container className="mt-3">
      <h2> BUDA Prices </h2>
      <hr />

      <h2 className="bg-success text-white p-3">Welcome!</h2>

      <h5 className="mt-4 mb-3">Transaction greatest operations last 24 Hours (each market): </h5>
      <Row className="align-items-center">
        <Col xs={8}>
          { (maxTransactions.length !== 0)
            ?
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Market</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Max Transaction</th>
                  <th>Buy/Sell</th>
                </tr>
              </thead>
              <tbody>
                {
                  maxTransactions.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx}</td>
                      <td>{item.market}</td>
                      <td>{item.amount}</td>
                      <td>$ {new Intl.NumberFormat('en-US').format(item.price)}</td>
                      <td>$ {new Intl.NumberFormat('en-US').format(item.maxTransaction)}</td>
                      <td>{item.direction}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
            :
            <>
            { (!errorMessages)
              ?
              <div className="d-flex align-items-center">
                <Spinner animation="border" />
                <strong className="mx-3 mb-0">Loading Data...</strong>
              </div>
              :
              <Alert variant="danger">
                {errorMessages}
              </Alert>
            }
            </>
          }
          
        </Col>
      </Row>
    </Container>
  );
}

export default App;
