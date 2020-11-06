import TokenManagement, { crypto } from '@binance-chain/javascript-sdk';
import { TW } from '@trustwallet/wallet-core';
import { Col, Form, message, Modal, Row } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breakpoint from 'react-socks';
import Binance from '../../clients/binance';
import { Context } from '../../context';
import { MODE } from '../../data/constants';
import { CHAIN_ID } from '../../env';
import { TimeLockContainer } from '../../styles/Components/TimeLock.styles';
import { addComma } from '../../utils/addComma';
import { reducer } from '../../utils/reducer';
import { toSatoshi } from '../../utils/toSatoshi';
import {
  Button,
  Coin,
  H1,
  Text,
  WalletAddress,
  WalletAddrShort,
} from '../pages/Components';
import TimeLockForm from '../TimeLock/TimeLockForm';

// Memo?: RUNE-B1A
const NETWORK_ID = 714;

const TimeLock = (props) => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [balances, setBalances] = useState(null);
  const [mode, setMode] = useState(null);
  const [loadingBalances, setLoadingBalancer] = useState(false);
  const [fee, setFee] = useState(null);
  const [timeLockTxs, setTimeLockTxs] = useState(null);
  const [lockTx, setLockTx] = useState(null);
  const [stateUpdate, setStateUpdate] = useState(1);
  const [totalLockedAmount, setTotalLockedAmount] = useState(null);

  // confirmation modal variables
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const context = useContext(Context);

  const currentTimestamp = moment().unix();

  const getFee = () => {
    Binance.fees()
      .then((response) => {
        const fee = response.data.find((item) => {
          return item.msg_type === 'timeLock';
        });
        setFee(Binance.calculateFee(fee.fee));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getBalances = () => {
    if (context.wallet && context.wallet.address) {
      setLoadingBalancer(true);
      Binance.getBalances(context.wallet.address)
        .then((response) => {
          console.log('Balances:', response);
          const b = (response || []).map((bal) => ({
            icon: 'coin-bep',
            ticker: bal.symbol,
            free: parseFloat(bal.free),
            frozen: parseFloat(bal.frozen),
            locked: parseFloat(bal.locked),
          }));
          setBalances([...b]);
          setLoadingBalancer(false);
        })
        .catch((error) => {
          setLoadingBalancer(false);
        });
    }
  };

  const getTimeLockTxs = async (address, selectedCoin) => {
    try {
      const res = await axios.get(
        `https://dex.binance.org/api/v1/timelocks/${address}`
      );
      const data = res.data;

      let lockedAmounts = [];
      data.forEach((tx) => {
        if (tx.amount[0].symbol === selectedCoin) {
          lockedAmounts.push(Number(tx.amount[0].amount));
        }
      });
      const lockedAmount = lockedAmounts.reduce(reducer, 0);

      const setTotalLockedAmountHandler = (lockedAmount) => {
        return Promise.resolve(setTotalLockedAmount(lockedAmount));
      };

      // Todo: Improve that show the timelock amount and timelock txs almost same time
      setTotalLockedAmountHandler(lockedAmount).then(() => {
        setTimeLockTxs(data);
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getFee();
  }, []);
  useEffect(() => {
    context.wallet && getTimeLockTxs(context.wallet.address, selectedCoin);
  }, [context.wallet, stateUpdate, selectedCoin, totalLockedAmount]);

  useEffect(() => {
    if (context.wallet && context.wallet.address) {
      setLoadingBalancer(true);
      Binance.getBalances(context.wallet.address)
        .then((response) => {
          console.log('Balances:', response);
          const b = (response || []).map((bal) => ({
            icon: 'coin-bep',
            ticker: bal.symbol,
            free: parseFloat(bal.free),
            frozen: parseFloat(bal.frozen),
            locked: parseFloat(bal.locked),
          }));
          setBalances([...b]);
          setLoadingBalancer(false);
        })
        .catch((error) => {
          setLoadingBalancer(false);
        });
    }
  }, [context.wallet]);
  console.log('balances', balances);

  const confirmation = (mode) => {
    const bnb = balances.find((b) => {
      return b.ticker === 'BNB';
    }) || { free: 0 };
    if (fee > bnb.free) {
      message.error(
        'Insufficient fund: Not enough for transaction fee of ' + fee + 'BNB',
        10
      );
      return;
    }

    setMode(mode);
    setVisible(true);
  };

  const trustSignTransaction = async (txInput) => {
    // Memo: Wallet connect class instance
    const wc = context.wallet.walletconnect;

    const request = await wc._formatRequest({
      method: 'trust_signTransaction',
      params: [
        {
          network: NETWORK_ID,
          transaction: JSON.stringify(txInput.toJSON()),
        },
      ],
    });
    console.log('request', request);
    try {
      return await wc._sendCallRequest(request);
    } catch (error) {
      throw error;
    }
  };

  const handleOk = async (values) => {
    if (!context.wallet || !context.wallet.address) {
      console.log('No wallet detected!');
      return;
    }

    setSending(true);
    const binance = Binance;

    if (context.wallet.walletconnect) {
      const accountResponse = await Binance.getAccount(context.wallet.address);
      const account = accountResponse.result;
      console.log('AccountInfo:', account);

      const addr = context.wallet.address;
      const id = lockTx ? lockTx.id : 0;
      console.log('id', id);
      const description = values.description;
      const timelockTimestamp = Number(moment(values.time).format('X'));
      const amount = [
        {
          denom: selectedCoin,
          amount: parseFloat(values.amount) * Math.pow(10, 8),
        },
      ];

      // Memo: Here we set the two main delegates - signing and broadcast.
      const client = Binance.bnbClient;

      const lockInput = TW.Binance.Proto.SigningInput.create({
        accountNumber: account.account_number,
        chainId: CHAIN_ID,
        sequence: account.sequence,
        timeLockOrder: {
          fromAddress: crypto.decodeAddress(addr),
          description: description,
          amount: amount,
          lockTime: timelockTimestamp,
        },
      });

      const relockInput = TW.Binance.Proto.SigningInput.create({
        accountNumber: account.account_number,
        chainId: CHAIN_ID,
        sequence: account.sequence,
        timeRelockOrder: {
          fromAddress: crypto.decodeAddress(addr),
          id: id,
          description: description,
          amount: amount,
          lockTime: timelockTimestamp,
        },
      });
      console.log('relockInput', relockInput);

      const unlockInput = TW.Binance.Proto.SigningInput.create({
        accountNumber: account.account_number,
        chainId: CHAIN_ID,
        sequence: account.sequence,
        timeUnlockOrder: {
          fromAddress: crypto.decodeAddress(addr),
          id: id,
        },
      });
      console.log('unlockInput', unlockInput);

      // Memo: The broadcast delegate should be a no-op (not do anything). This is because we broadcast in the signing delegate instead.
      Binance.bnbClient.setBroadcastDelegate(() => {});

      // Memo: The signing delegate is responsible for handling the WC signing flow and broadcasting the signed transaction through bnbClient.
      Binance.bnbClient.setSigningDelegate(async (tx, signMsg) => {
        console.log('running WalletConnect signing...');
        try {
          const txInput =
            mode === MODE.TIMELOCK
              ? lockInput
              : mode === MODE.TIMERELOCK
              ? relockInput
              : unlockInput;

          const result = (window.result = await trustSignTransaction(txInput));
          console.log('Successfully signed tx:', result);
          // Memo: The broadcast happens here instead of it being done by the bnbClient's broadcast delegate.
          const response = await Binance.bnbClient.sendRawTransaction(
            result,
            true
          );
          if (response.result[0].ok) {
            const txURL = Binance.txURL(response.result[0].hash);
            message.success(
              <p>
                Sent.{' '}
                <a target='_blank' rel='noopener noreferrer' href={txURL}>
                  See transaction
                </a>
                .
              </p>,
              5
            );
            setVisible(false);
            setSending(false);
            getBalances();
            setTimeout(() => {
              getTimeLockTxs(context.wallet.address, selectedCoin);
            }, 2000);
          }
        } catch (err) {
          setVisible(false);
          setSending(false);
          console.error('WalletConnect error!', err);
          throw err;
        }
        // Memo: We return the (unsigned) TX, which would normally cause a no signers error with the default broadcast delegate.
        // However, we have used the no-op broadcast delegate above, so this is OK.
        return tx;
      });

      // Memo: Trigger the timeLock from the standard Binance SDK.
      if (mode === MODE.TIMELOCK) {
        console.log('Run timelock');
        try {
          await client.tokens.timeLock(
            addr,
            description,
            amount,
            timelockTimestamp
          );

          // Memo: Check whether TW sign can directly broadcast without go through `setSigningDelegate`.
          // Error: `trustSignTransaction` didn't return anything
          // const result = (window.result = await trustSignTransaction(
          //   lockInput
          // ));
          // console.log('Successfully signed tx:', result);
          // const response = await Binance.bnbClient.sendRawTransaction(
          //   result,
          //   true
          // );
          // console.log('response', response);
        } catch (err) {
          window.err = err;
          console.error('TimeLock error:', err);
          message.error(err.message);
          setSending(false);
        }
      } else if (mode === MODE.TIMERELOCK) {
        console.log('Run timeRelock');
        try {
          await client.tokens.timeRelock(
            addr,
            id,
            description,
            amount,
            timelockTimestamp
          );

          // Memo: Check whether TW sign can directly broadcast without go through `setSigningDelegate`.
          // Error: Signature verification failed
          // const result = (window.result = await trustSignTransaction(
          //   relockInput
          // ));
          // console.log('Successfully signed tx:', result);
          // const response = await Binance.bnbClient.sendRawTransaction(
          //   result,
          //   true
          // );
          // console.log('response', response);
        } catch (err) {
          window.err = err;
          console.error('TimeRelock error:', err);
          message.error(err.message);
          setSending(false);
        }
      } else if (mode === MODE.TIMEUNLOCK) {
        console.log('Run timeUnlock');
        try {
          await client.tokens.timeUnlock(addr, id);

          // Memo: Check whether TW sign can directly broadcast without go through `setSigningDelegate`.
          // Error: Signature verification failed
          // const result = (window.result = await trustSignTransaction(
          //   unlockInput
          // ));
          // console.log('Successfully signed tx:', result);
          // const response = await Binance.bnbClient.sendRawTransaction(
          //   result,
          //   true
          // );
          // console.log('response', response);
        } catch (err) {
          window.err = err;
          console.error('TimeUnlock error:', err);
          message.error(err.message);
          setSending(false);
        }
      }
    } else {
      if (context.wallet.keystore) {
        try {
          const privateKey = crypto.getPrivateKeyFromKeyStore(
            context.wallet.keystore,
            values.password
          );
          binance.setPrivateKey(privateKey);
        } catch (err) {
          window.err = err;
          console.error('Validating keystore error:', err);
          message.error(err.message);
          setSending(false);
          return;
        }
      } else if (context.wallet.ledger) {
        binance.useLedgerSigningDelegate(
          context.wallet.ledger,
          null,
          null,
          null,
          context.wallet.hdPath
        );
      } else {
        throw new Error('no wallet detected');
      }

      try {
        const manager = new TokenManagement(Binance.bnbClient).tokens;
        var results;
        if (mode === MODE.TIMELOCK) {
          console.log('manager', manager);
          const addr = context.wallet.address;
          const description = values.description;
          const timeLockTimestamp = Number(moment(values.time).format('X'));
          const amount = [
            {
              denom: selectedCoin,
              amount: toSatoshi(values.amount),
            },
          ];

          console.log('addr:', addr);
          console.log('description:', description);
          console.log('amount:', amount);
          console.log('timeLockTimestamp', timeLockTimestamp);

          results = await manager.timeLock(
            addr,
            description,
            amount,
            timeLockTimestamp
          );
          setTimeout(() => {
            setStateUpdate(stateUpdate + 1);
          }, 1000);
        } else if (mode === MODE.TIMEUNLOCK) {
          const addr = context.wallet.address;
          const id = lockTx.id;
          console.log('addr:', addr);
          console.log('id:', id);
          console.log('Run timeunlock function');

          results = await manager.timeUnlock(addr, id);
          setTimeout(() => {
            setStateUpdate(stateUpdate + 1);
          }, 1000);
        } else if (mode === MODE.TIMERELOCK) {
          const addr = context.wallet.address;
          const description = values.description;
          const id = lockTx.id;
          const timeLockTimestamp = Number(moment(values.time).format('X'));
          const amount = [
            {
              denom: selectedCoin,
              amount: toSatoshi(values.amount),
            },
          ];

          console.log('addr:', addr);
          console.log('description:', description);
          console.log('amount:', amount);
          console.log('timeLockTimestamp', timeLockTimestamp);
          console.log('id', id);
          console.log('Run timerelock function');

          results = await manager.timeRelock(
            addr,
            id,
            description,
            amount,
            timeLockTimestamp
          );
          setTimeout(() => {
            setStateUpdate(stateUpdate + 1);
          }, 1000);
        } else {
          throw new Error('invalid mode');
        }
        setSending(false);
        if (results.result[0].ok) {
          const txURL = Binance.txURL(results.result[0].hash);
          message.success(
            <Text>
              Sent.{' '}
              <a target='_blank' rel='noopener noreferrer' href={txURL}>
                See transaction
              </a>
              .
            </Text>,
            10
          );
          setVisible(false);
          getBalances();
        }
      } catch (err) {
        window.err = err;
        console.error('TimeLock error:', err);
        message.error(err.message);
        setSending(false);
      }
      // binance.clearPrivateKey()
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const passwordRequired = context.wallet && 'keystore' in context.wallet;

  var balance = 0;

  // styling
  const coinRowStyle = {
    margin: '10px 0px',
    marginLeft: '10px',
    marginRight: '10px',
    marginTop: '20px',
  };

  const paneStyle = {
    backgroundColor: '#ededed',
    marginRight: '20px',
    marginTop: '20px',
    borderRadius: 5,
  };

  return (
    <TimeLockContainer>
      <Row>
        <Col xs={24} sm={24} md={22} lg={20}>
          <div>
            <H1>Timelock</H1>
          </div>
          <div>
            <Text size={18}>
              timelock tokens easily using the Binance Chain timelock function.
            </Text>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Breakpoint small down>
              {!loadingBalances && context.wallet && (
                <Row>
                  <Col xs={24} sm={24} md={12} style={{ marginTop: '20px' }}>
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href={
                        'https://explorer.binance.org/address/' +
                        context.wallet.address
                      }>
                      <WalletAddrShort />
                    </a>
                  </Col>
                </Row>
              )}
            </Breakpoint>

            <Breakpoint medium up>
              {!loadingBalances && context.wallet && (
                <Row>
                  <Col xs={24} sm={24} md={12} style={{ marginTop: '20px' }}>
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href={
                        'https://explorer.binance.org/address/' +
                        context.wallet.address
                      }>
                      <WalletAddress />
                    </a>
                  </Col>
                </Row>
              )}
            </Breakpoint>

            <Row style={{ marginTop: '40px' }}>
              {loadingBalances && context.wallet && (
                <Text>
                  <i>Loading balances, please wait...</i>
                </Text>
              )}

              {!context.wallet && (
                <Link to='/wallet/unlock'>
                  <Button fill>CONNECT WALLET</Button>
                </Link>
              )}

              {!loadingBalances &&
                context.wallet &&
                (balances || []).length === 0 && (
                  <Text>No coins available</Text>
                )}
            </Row>

            <Row>
              <Col xs={24}>
                {!loadingBalances &&
                  context.wallet &&
                  (balances || []).length > 0 && (
                    <Row style={{ marginBottom: '50px' }}>
                      <Col xs={22} xl={10} xxl={9} style={paneStyle}>
                        <Row style={{ marginTop: '10px', marginLeft: '10px' }}>
                          <Col xs={24} style={{ paddingRight: '10px' }}>
                            <Text size={18}>SELECT TOKEN BELOW</Text>
                            <hr />
                          </Col>
                        </Row>

                        {!loadingBalances &&
                          (balances || []).map((coin) => (
                            <Row key={coin.ticker} style={coinRowStyle}>
                              <Col xs={24}>
                                <Coin
                                  {...coin}
                                  onClick={setSelectedCoin}
                                  border={selectedCoin === coin.ticker}
                                />
                              </Col>
                            </Row>
                          ))}
                      </Col>

                      <Col
                        xs={22}
                        xl={13}
                        xxl={14}
                        style={{
                          // backgroundColor: '#ededed',
                          backgroundColor: 'transparent',
                          marginTop: '20px',
                          borderRadius: 5,
                        }}>
                        {selectedCoin && (
                          <>
                            <Row
                              style={{
                                marginBottom: '10px',
                                backgroundColor: '#ededed',
                                padding: '10px',
                                borderRadius: '6px',
                              }}>
                              <Col xs={24}>
                                <Row>
                                  <Col xs={24}>
                                    <Text size={18}>New Timelock</Text>
                                    <hr />
                                    <Row>
                                      <Col
                                        xs={12}
                                        style={{ marginTop: '10px' }}>
                                        <span>
                                          <Text>TOTAL TIMELOCK:</Text>
                                        </span>
                                        <span
                                          style={{ margin: '0px 20px' }}
                                          size={22}>
                                          {addComma(totalLockedAmount, 3)}
                                        </span>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={24} style={{ textAlign: 'center' }}>
                                    <Row>
                                      <Col>
                                        <Button
                                          fill
                                          style={{
                                            height: 40,
                                            width: 170,
                                            marginTop: 14,
                                          }}
                                          onClick={() => {
                                            setLockTx(null);
                                            confirmation('TIMELOCK');
                                          }}
                                          loading={sending}>
                                          TIMELOCK
                                        </Button>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>

                            {/* Memo: TimeUnlock section */}
                            {timeLockTxs !== null &&
                              timeLockTxs
                                .filter(
                                  //Question: What if amount array contain more than 1 lock txs?
                                  (tx) => tx.amount[0].symbol === selectedCoin
                                )
                                .map((tx) => {
                                  const unlockTime = moment(tx.locktime).format(
                                    'X'
                                  );
                                  return (
                                    <Row
                                      key={tx.id}
                                      style={{
                                        marginTop: '20px',
                                        marginBottom: '10px',
                                        backgroundColor: '#ededed',
                                        padding: '10px',
                                        borderRadius: '6px',
                                      }}>
                                      <Col xs={24}>
                                        <Row>
                                          <Col xs={24}>
                                            <Text size={18}>
                                              Time Unlock/Relock
                                            </Text>
                                            <hr />
                                            <Row>
                                              <Col
                                                xs={24}
                                                style={{ marginTop: '10px' }}>
                                                <div className='content-row'>
                                                  <span>
                                                    <Text>AMOUNT:</Text>
                                                  </span>
                                                  <span
                                                    className='content-text'
                                                    size={22}>
                                                    {Number(
                                                      tx.amount[0].amount
                                                    ) > 999
                                                      ? addComma(
                                                          Number(
                                                            tx.amount[0].amount
                                                          ),
                                                          3
                                                        )
                                                      : Number(
                                                          tx.amount[0].amount
                                                        )}
                                                  </span>
                                                </div>
                                                <div className='content-row'>
                                                  <span>
                                                    <Text>DESCRIPTION:</Text>
                                                  </span>
                                                  <span
                                                    className='content-text'
                                                    size={22}>
                                                    {tx.description}
                                                  </span>
                                                </div>
                                                <div className='content-row'>
                                                  <span>
                                                    <Text>LOCKTIME:</Text>
                                                  </span>
                                                  <span
                                                    className='content-text'
                                                    size={22}>
                                                    {moment(tx.locktime).format(
                                                      'llll'
                                                    )}
                                                  </span>
                                                </div>
                                              </Col>
                                            </Row>

                                            <Row
                                              gutter={[8, 8]}
                                              style={{ textAlign: 'center' }}>
                                              <Col
                                                xs={{ span: 24 }}
                                                lg={{ span: 8, offset: 1 }}
                                                xl={{ span: 12, offset: 0 }}>
                                                <Button
                                                  disabled={
                                                    unlockTime >
                                                    currentTimestamp
                                                  }
                                                  fill
                                                  style={{
                                                    height: 40,
                                                    width: 170,
                                                    marginTop: 10,
                                                    opacity:
                                                      unlockTime >
                                                      currentTimestamp
                                                        ? 0.6
                                                        : 1,
                                                  }}
                                                  onClick={() => {
                                                    setLockTx(tx);
                                                    confirmation(
                                                      MODE.TIMEUNLOCK
                                                    );
                                                  }}
                                                  loading={sending}>
                                                  TIMEUNLOCK
                                                </Button>
                                              </Col>
                                              <Col
                                                xs={{ span: 24 }}
                                                lg={{ span: 8, offset: 4 }}
                                                xl={{ span: 12, offset: 0 }}>
                                                <Button
                                                  disabled={
                                                    unlockTime >
                                                    currentTimestamp
                                                  }
                                                  fill
                                                  style={{
                                                    height: 40,
                                                    width: 170,
                                                    marginTop: 10,
                                                    opacity:
                                                      unlockTime >
                                                      currentTimestamp
                                                        ? 0.6
                                                        : 1,
                                                  }}
                                                  onClick={() => {
                                                    setLockTx(tx);
                                                    confirmation(
                                                      MODE.TIMERELOCK
                                                    );
                                                  }}
                                                  loading={sending}>
                                                  TIMERELOCK
                                                </Button>
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  );
                                })}
                          </>
                        )}
                      </Col>
                    </Row>
                  )}
              </Col>
            </Row>
          </div>

          <Modal
            destroyOnClose={true}
            title={mode}
            visible={visible}
            footer={null}
            onCancel={handleCancel}
            bodyStyle={{ backgroundColor: '#fff', paddingBottom: 0 }}
            headStyle={{ backgroundColor: '#2B3947', color: '#fff' }}>
            <WrappedTimeLockForm
              mode={mode}
              lockTx={lockTx}
              fee={fee}
              password={passwordRequired}
              button={mode}
              onSubmit={handleOk}
              onCancel={handleCancel}
              loading={sending}
            />
          </Modal>
        </Col>
        {/* <Col xs={24} sm={24} md={1} lg={2}></Col> */}
      </Row>
    </TimeLockContainer>
  );
};

const WrappedTimeLockForm = Form.create({ name: 'timeLock' })(TimeLockForm);

export default TimeLock;
