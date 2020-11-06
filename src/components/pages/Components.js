import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button as AntButton } from 'antd';

import { Context } from '../../context';
import { AmounttoString } from '../../utils/utility';
import { COIN } from '../../data/constants';

export const WalletAddress = (props) => {
  const context = useContext(Context);
  if (context.wallet && context.wallet.address) {
    return <PillTextOrng>{context.wallet.address}</PillTextOrng>;
  }
  return <Fragment />;
};

export const WalletAddrShort = (props) => {
  const context = useContext(Context);
  if (context.wallet && context.wallet.address) {
    const address = context.wallet.address;
    const addr = address.substring(0, 7).concat('...');
    const addrShort = addr.concat(
      address.substring(address.length - 4, address.length)
    );
    return <PillTextOrng>{addrShort}</PillTextOrng>;
  }
  return <Fragment />;
};

const defaultStyles = {
  fontFamily: 'Helvetica',
  fontSize: '14px',
  color: '#848E9C',
  letterSpacing: 0,
};

export const H1 = (props) => {
  let styles = { ...defaultStyles, ...(props.style || {}) };
  styles.fontFamily = 'Helvetica-Light';
  styles.fontSize = '42px';
  return <span style={styles}>{props.children}</span>;
};

export const Text = (props) => {
  let styles = { ...defaultStyles, ...(props.style || {}) };
  if (props.bold) {
    styles.fontFamily = 'Helvetica-Bold';
  }
  if (props.color) {
    styles.color = props.color;
  }
  if (props.size) {
    styles.fontSize = props.size;
  }
  return (
    <span className='Center' style={styles}>
      {props.children}
    </span>
  );
};

export const PillText = (props) => {
  let styles = { ...defaultStyles, ...(props.style || {}) };
  styles.backgroundColor = '#ededed';
  styles.borderRadius = 28;
  styles.padding = '8px 20px';
  styles.fontSize = '14px';
  return <span style={styles}>{props.children}</span>;
};

export const PillTextOrng = (props) => {
  let styles = { ...defaultStyles, ...(props.style || {}) };
  styles.backgroundColor = '#F0B90B';
  styles.borderRadius = 28;
  styles.padding = '8px 20px';
  styles.fontSize = '14px';
  styles.color = '#FFF';
  return <span style={styles}>{props.children}</span>;
};

export const Icon = (props) => {
  const lookup = {
    plus: 'Asset-plus-grey.svg',
    'fees-active': 'Fee-active.svg',
    'fees-inactive': 'Fee-grey.svg',
    'swap-active': 'CLP-active.svg',
    'swap-inactive': 'CLP-grey.svg',
    'coin-bep': 'Coin-BEP2.svg',
    'coin-bnb': 'Coin-bnb2.svg',
    BNB: 'Coin-BNB.svg',
    'dao-active': 'DAO-active.svg',
    'dao-inactive': 'DAO-grey.svg',
    'escrow-active': 'Escrow-active.svg',
    'escrow-inactive': 'Escrow-grey.svg',
    'hedged-escrow-active': 'HEscrow-active.svg',
    'hedged-escrow-inactive': 'HEscrow-grey.svg',
    'freezer-active': 'Freezer-active.svg',
    'freezer-inactive': 'Freezer-grey.svg',
    'locker-active': 'Freezer-active.svg',
    'locker-inactive': 'Freezer-grey.svg',
    'timelock-active': 'DAO-active.svg',
    'timelock-inactive': 'DAO-grey.svg',
    logo: 'Logo-BinanceTools.svg',
    'multi-send-active': 'Multi-sender-active.svg',
    'multi-send-inactive': 'Multi-sender-grey.svg',
    'multi-sig-active': 'Multi-sig-active.svg',
    'multi-sig-inactive': 'Multi-sig-grey.svg',
    step1: 'step1.svg',
    step2: 'step2.svg',
    openapp: 'ledger-app.svg',
    pincode: 'ledger-pin.svg',
    qrcode: 'qr-code.svg',
  };
  // console.log('props.icon', props.icon);
  return props.ticker ? (
    <img
      src={'/images/' + lookup[props.ticker]}
      alt={props.img}
      {...props}
    />
  ) : (
    <img src={'/images/' + lookup[props.icon]} alt={props.img} {...props} />
  );
};

export const Center = (props) => (
  <div
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {props.children}
  </div>
);

const Button = (props) => {
  let styles = { ...defaultStyles, ...(props.style || {}) };
  styles.borderRadius = 9;
  if (props.bold || props.bold === 'true') {
    styles.fontFamily = 'Helvetica-Bold';
  }
  // if (props.fill && !props.disabled) {
  if (props.fill) {
    styles.color = '#fff';
    styles.backgroundColor = '#F0B90B';
    styles.borderColor = '#F0B90B';
  } else if (props.disabled) {
    styles.color = '#fff';
    styles.backgroundColor = '#F0B90B';
    styles.borderColor = '#F0B90B';
  } else {
    styles.color = '#F0B90B';
    styles.backgroundColor = '#fff';
    styles.border = '1px solid #F0B90B';
    styles.borderColor = '#F0B90B';
  }
  return (
    <AntButton
      disabled={props.disabled}
      style={styles}
      onClick={props.onClick}
      onChange={props.onChange}
      type={props.type}
      loading={props.loading}>
      {props.children}
    </AntButton>
  );
};
Button.defaultProp = {
  disabled: false,
  fill: false,
  bold: false,
  loading: false,
};
Button.propTypes = {
  fill: PropTypes.bool,
  bold: PropTypes.bool,
  loading: PropTypes.bool,
};

const Coin = ({ onClick, icon, ticker, free, border }) => {
  let styles = {
    width: '100%',
    paddingLeft: 30,
    cursor: 'pointer',
    padding: 5,
  };
  if (border) {
    styles.border = '1px solid #F0B90B';
    styles.borderRadius = 6;
  }
  return (
    <Center>
      <div
        style={styles}
        onClick={() => {
          if (onClick) {
            onClick(ticker);
          }
        }}>
        <Icon icon={ticker} />
        <span style={{ margin: '0px 10px' }}>{ticker}</span>
        <span style={{ marginLeft: 10, float: 'right' }}>
          {AmounttoString(free)}
        </span>
      </div>
    </Center>
  );
};
Coin.defaultProps = {
  border: false,
};

export { Button, Coin };
