import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { Row, Col, Card, Icon as IconAD } from 'antd';

import { Center, Icon, Text, Button} from '../pages/Components'

const { Meta } = Card;

const FeatureCard = ({ item }) => {
  const [hover, setHover] = useState(false);

  const styles = {
    border: '1px solid #EDEDED',
    position: 'relative',
    zIndex: 10,
    padding: 10,
    borderRadius: 10,
    boxShadow: '0 2px 16px 0 rgba(0,0,0,0.04)',
    width: 260,
    height: 400,
  };

  if (hover) {
    styles.boxShadow = '0 2px 24px 0 rgba(0,0,0,0.12)';
  }

  return (
    <div>
      <Col xs={24} sm={24} md={12} lg={8} xl={6} style={{ marginTop: 20 }}>
        <Center>
          <Link to={item.link}>
            <Card
              cover={
                <Center>
                  <Icon style={{ width: 40 }} icon={item.icon} />
                </Center>
              }
              style={styles}
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}>
              <Meta
                title={
                  <Center>
                    <Text size={18} bold>
                      {item.title}
                    </Text>
                  </Center>
                }
                description={<Text>{item.description}</Text>}
              />
            </Card>
          </Link>
        </Center>
      </Col>
    </div>
  );
};

const Home = (props) => {
  const data = [
    // {
    //   icon: 'fees-active',
    //   link: 'fees',
    //   title: 'NETWORK FEES',
    //   description: 'Quickly view Binance Chain transaction fees, asset fees, Binance DEX Fees and Governance Fees.',
    // },
    {
      icon: 'multi-send-active',
      link: 'multi-send',
      title: 'MULTI-SENDER',
      description:
        'This tool uses the Binance Chain batched transaction feature to send assets to multiple addresses easily. Users can manually add addresses, memos and amounts, or alternatively upload from a CSV file to send large amounts of transactions. Users pay the Batch Transaction fee.',
    },
    {
      icon: 'freezer-active',
      link: 'freezer',
      title: 'FREEZER',
      description:
        'This tool uses Binance Chain freeze and unfreeze token features to freeze BEP2 tokens on the user wallet.',
    },
    {
      icon: 'timelock-active',
      link: 'timelock',
      title: 'TIMELOCK',
      description:
        'This tool uses Binance Chain timelock token features to timelock BEP2 tokens on the user wallet.',
    },
    /*
    {
      icon: 'multi-sig-active',
      link: 'multi-sig',
      title: 'MULTI-SIGNATURE',
      description: 'This tool uses Binance Chain multi-key store to persist state about multi-signature wallets on-chain and is non-interactive since signers don’t need to be online at the same time. Users first set up the wallet by specifying the threshold and maximum number of signatures (such as a 2 of 3 wallet), and then sign in turn to send transactions from the wallet.',
    },
    {
      icon: 'escrow-active',
      link: 'escrow',
      title: 'ESCROW',
      description: 'This tool is an adapted multi-signature module that places restrictions on how funds can be spent between parties. Users set up details about how the payment should be made, and once both parties are happy, funds are released to the correct recipient. The third-party can step in to process disputes and charges a small escrow fee.',
    },
    {
      icon: 'hedged-escrow-active',
      link: 'hedged-escrow',
      title: 'HEDGED-ESCROW',
      description: 'This tool is an adapted escrow module that allows a float to be maintained, and an external price reference to be added (such as paying in BNB priced in USD). Users specify payment amounts in the price of the external asset such that price volatility risk is removed whilst the asset is escrowed. The float in the escrow underwrites payments and as such is very useful for marketplaces.',
    },
    {
      icon: 'dao-active',
      link: 'dao',
      title: 'DAO MODULE',
      description: 'This tool allows developers to add staking, election and voting logic to their dApps. Users can stake assets on their wallets with a designated un-bonding period. They can then create elections that require minimum stake participation with designated outcomes. Votes can be tallied uses 1p1v or more elaborate schemes such as quadratic voting to determine an outcome.',
    },*/
    // {
    //   icon: 'swap-active',
    //   link: 'swap',
    //   title: 'LIQUIDITY POOLS',
    //   description: 'This module allows users to stake assets and BNB in on-chain pools, and then perform trustless swaps across pools. The module features always-on liquidity and fair market-based prices that are resistant to manipulation. Stakers earn fees when staking assets, and users can instantly swap assets in a single transaction.',
    // }
  ];

  const stylesTop = {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    border: '1px solid #EDEDED',
    position: 'relative',
    zIndex: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
  };

  return (
    <div>
      <Row style={{ margin: 20, marginTop: 40 }} gutter={24}>
        <Row>
          <Col style={stylesTop}>
            <Text size={18} bold>
              Learn the Tutorial
            </Text>
            <br></br>
            <Text size={12}>
              {' '}
              Want to know how this tool works? Follow this tutorial to build a
              Binance Chain powered web-app.
            </Text>
            <br></br>

            <Text size={12}>
              {' '}
              Build a project with Binance Chain SDK, connect a wallet, read
              balances, make transactions and more.
            </Text>
            <br></br>

            <a
              href='https://docs.beptools.org'
              rel='noopener noreferrer'
              target='_blank'>
              <Button style={{ marginTop: 20 }}>
                LAUNCH TUTORIAL <IconAD type='arrow-right' />
              </Button>
            </a>
          </Col>
        </Row>

        {data.slice(0, 6).map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </Row>
    </div>
  );
};

export default Home;
