import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import _ from 'lodash';

function App() {
  //------------------------------------------
  // HOOKS & VARIABLES
  //------------------------------------------

  // States
  const [maxTransactions, setMaxTransactions] = useState([]);

  //------------------------------------------
  // HANDLERS & AUX FUNCTIONS
  //------------------------------------------

  const onClickFetchData = async (e) => {
    let { data: dataMarkets } = await axios.get('/markets');
    let { markets } = dataMarkets;
    let timestamp_24hrs_ago = _.now() - 24 * 60 * 60 * 1000;
    let maxTransactionsToUpdate = [];

    for (let eachMarket of markets) {
      let { data: dataTradesForMarket } = await axios.get(
        `/markets/${eachMarket.id}/trades?timestamp=${timestamp_24hrs_ago}`
      );
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
        let transaction = eachTradeEntry[1] * eachTradeEntry[2];

        if (transaction > maxTransactionOfMarket.maxTransaction) {
          maxTransactionOfMarket.maxTransaction = transaction;
          maxTransactionOfMarket.timestamp = eachTradeEntry[0];
          maxTransactionOfMarket.amount = eachTradeEntry[1];
          maxTransactionOfMarket.price = eachTradeEntry[2];
          maxTransactionOfMarket.direction = eachTradeEntry[3];
        }
      }
      maxTransactionsToUpdate.push(maxTransactionOfMarket);
      setMaxTransactions([...maxTransactionsToUpdate]);
    }
  };
  const onClickResetData = (e) => {
    setMaxTransactions([]);
  };

  //------------------------------------------
  // JSX
  //------------------------------------------

  return (
    <Container className="mt-3">
      <h2> BUDA Prices </h2>
      <hr />
      <div className="mb-4">
        <span> Fetch data: </span>{' '}
        <Button
          variant="success"
          size="sm"
          className="py-0"
          onClick={onClickFetchData}
        >
          Click!
        </Button>{' '}
        <Button
          variant="danger"
          size="sm"
          className="py-0"
          onClick={onClickResetData}
        >
          Reset!
        </Button>
      </div>

      <h5 className="mb-1">Transaction greatest operation last 24 Hours (for each market): </h5>
      <Row className="align-items-center">
        <Col xs={8}>
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
              {maxTransactions.length > 0 &&
                maxTransactions.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx}</td>
                    <td>{item.market}</td>
                    <td>{item.amount}</td>
                    <td>{item.price}</td>
                    <td>{item.maxTransaction}</td>
                    <td>{item.direction}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
